import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import * as  _ from "lodash-es";
import { LocalStorage, LocalStorageService } from "ngx-store";
import { forkJoin, iif, Observable, of, throwError } from "rxjs";
import { catchError, map, mergeMap, concatMap, bufferCount, tap, filter } from "rxjs/operators";
import { ENVIRONMENT, Environment } from "src/app/app.module";
import { UtilsService } from "./utils.service";

enum Origin {
  Source = "source",
  Target = "target",
}

@Injectable({ providedIn: "root" })
export class DataService implements Resolve<[Core.SelectableItem<Language.Result>[], Link.Result[], Core.SelectableItem<Dictionary.Result>[]]> {
  sourceDictionaries: Core.SelectableItem<Dictionary.Result>[] = [];
  targetDictionaries: Core.SelectableItem<Dictionary.Result>[] = [];
  // Additional search parameters
  sourceDict!: string;
  targetLanguage!: string;
  targetDict!: string;
  similarity!: string;
  sourceLanguages: Core.SelectableItem<Language.Result>[] = [];
  targetLanguages: Core.SelectableItem<Language.Result>[] = [];
  sourceDictIds: string[] = [];
  targetDictIds: string[] = [];
  sourceLanguageCodes: string[] = [];
  targetLanguageCodes: string[] = [];
  @LocalStorage() private languages: Core.SelectableItem<Language.Result>[] = [];
  @LocalStorage() private dictionaries: Core.SelectableItem<Dictionary.Result>[] = [];
  @LocalStorage() private links: Link.Result[] = [];
  @LocalStorage() private rawLinks: Link.RawResult[] = [];

  private cachedDictionaries: Map<string, Dictionary.Result> = new Map<string, Dictionary.Result>();
  @LocalStorage() private lastPathParameters!: Link.Parameters;
  private readonly apiUrl: API.URL;
  private readonly apikey: API.Key;
  private readonly email: API.Email;

  constructor(
    private httpClient: HttpClient,
    private utils: UtilsService,
    private localStorage: LocalStorageService,
    private route: ActivatedRoute,
    @Inject(ENVIRONMENT) environment: Environment,
  ) {
    this.apiUrl = environment?.api?.clientUrl ?? "";
    this.email = environment?.api?.email ?? "";
    this.apikey = environment?.api?.apiKey ?? "";
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<[Core.SelectableItem<Language.Result>[], Link.Result[], Core.SelectableItem<Dictionary.Result>[]]> {
    return this.listLinks$(route).pipe(
      mergeMap((dictionaries) => {
        return forkJoin([
          this.listLanguages$().pipe(mergeMap(() => this.prepareLanguageData$(route))),
          of(dictionaries),
          this.listDictionaries$({}, route).pipe(mergeMap(() => this.prepareDictData$(route)))
        ]).pipe(
          catchError(() => {
            return of([this.languages, this.links, this.dictionaries]) as Observable<[Core.SelectableItem<Language.Result>[], Link.Result[], Core.SelectableItem<Dictionary.Result>[]]>;
          }),
        );
      })
    );

  }

  listLinks$(route: ActivatedRouteSnapshot): Observable<Link.Result[]> {
    const pathParameters = route.params as Link.Parameters;
    if (_.isEmpty(pathParameters)) return of([]);
    let parameters = {...pathParameters} as Link.Parameters;
    const {sourceDict, targetLanguage, targetDict, similarity, conceptView = "false"} = route.queryParams;
    if (!!sourceDict) {
      parameters.sourceDict = sourceDict;
    }
    if (!!similarity) {
      parameters.similarity = similarity;
    }
    this.localStorage.remove("links");
    this.localStorage.set("noResults", false);
    return this.fetchLinks$({...parameters}).pipe(
      mergeMap((results: Link.RawResult[]) => {
        this.localStorage.set("noResults", true);
        return iif(() => _.isEmpty(results), of([]), of(results))
      }),
      mergeMap((results: Link.RawResult[]) => {
        this.lastPathParameters = {..._.cloneDeep(pathParameters), sourceDict};
        this.rawLinks = results;
        results = _.filter(results, (result) => (result.targetDictConcept + "") === conceptView);
        const bufferSize = _.size(results);
        return of(results).pipe(
          concatMap((links) => links),
          concatMap((link: Link.RawResult) => {
            return iif(
              () => !!link.sourceDictConcept,
              this.fetchSupportingLinks$(link, Origin.Source),
              this.updateLanguageLabel$(link, Origin.Source)
            );
          }),
          concatMap((link: Link.RawResult) => {
            return iif(
              () => !!link.targetDictConcept,
              this.fetchSupportingLinks$(link, Origin.Target),
              this.updateLanguageLabel$(link, Origin.Target)
            );
          }),
          filter((result) => {
            if (!targetLanguage || result.targetDictConcept) return true;
            return _.isEmpty(result.targetLang) || result.targetLang === targetLanguage;
          }),
          map((link: Link.RawResult) => {
            if (!targetLanguage) return link;
            if (link.targetConnectedLinks) {
              link.targetConnectedLinks = _.filter(link.targetConnectedLinks, (link) => {
                return link.targetLang === targetLanguage;
              })
            }
            return link;
          }),
          filter((result) => {
            if (!targetDict || result.targetDictConcept) return true;
            return _.isEmpty(result.targetDict) || result.targetDict === targetDict;
          }),
          map((link: Link.RawResult) => {
            if (!targetDict) return link;
            if (link.targetConnectedLinks) {
              link.targetConnectedLinks = _.filter(link.targetConnectedLinks, (link) => {
                return link.targetDict === targetDict;
              })
            }
            return link;
          }),
          map((link: Link.RawResult) => {
            const result: Link.Result = {
              source: [],
              target: []
            };
            if (!!link.sourceConnectedLinks) {
              result.source = link.sourceConnectedLinks.map((link) => {
                this.sourceDictIds = _.uniq([...this.sourceDictIds, link.sourceDict]);
                return this.transformToSourceLink(link);
              });
            } else {
              this.sourceDictIds = [...this.sourceDictIds, link.sourceDict];
              result.source = [this.transformToSourceLink(link)];
            }
            // Transform it to meta data for dictionary, due to the fact it's lost otherwise
            if (link.targetDictConcept) {
              result.concept = this.transformToTargetLink(link)
              this.targetDictIds = _.uniq([...this.targetDictIds, ..._.map(link.targetConnectedLinks, "targetDict")]);
              this.targetLanguageCodes = _.uniq([...this.targetLanguageCodes, ..._.map(link.targetConnectedLinks, "targetLang")]);
            } else {
              this.targetDictIds = [...this.targetDictIds, link.targetDict];
              this.targetLanguageCodes = [...this.targetLanguageCodes, link.targetLang];
            }
            if (!!link.targetConnectedLinks) {
              result.target = link.targetConnectedLinks.map((childLink) => {
                return this.transformToTargetLink(childLink);
              });
            } else {
              result.target = [this.transformToTargetLink(link)];
            }
            return result;
          }),
          bufferCount(bufferSize)
        );
      }),
      tap((links) => {
        this.localStorage.set("noResults", false);
        this.links = links;
      }),
    );
  }

  prepareDictData$(route: ActivatedRouteSnapshot): Observable<Core.SelectableItem<Dictionary.Result>[]> {
    const {sourceDict, targetDict } = route.queryParams;
    const { sourceLanguage } = route.params;
    this.sourceDictionaries = _.filter(!!sourceDict ? _.cloneDeep(this.dictionaries).map((item) => {
      item.selected = item.value.id === sourceDict;
      return item;
    }) : _.cloneDeep(this.dictionaries), (dictionary) => {
      return dictionary.value.language === sourceLanguage && _.includes(this.sourceDictIds, dictionary.value.id);
    });
    this.targetDictionaries = _.filter(!!targetDict ? _.cloneDeep(this.dictionaries).map((item) => {
      item.selected = item.value.id === targetDict;
      return item;
    }) : _.cloneDeep(this.dictionaries), (item) => {
      return _.includes(this.targetDictIds, item.value.id);
    });
    return of(this.dictionaries);
  }

  listDictionaries$(parameters: Dictionary.Parameters = {}, route: ActivatedRouteSnapshot): Observable<Core.SelectableItem<Dictionary.Result>[]> {
    if (this.utils.isObjectEmpty(parameters) && !_.isEmpty(this.dictionaries)) {
      return of(this.dictionaries).pipe();
    }
    return this.httpClient.post<Dictionary.ListResults>(this.apiUrl + "/api/listDict", {...parameters, ...this.defaultParameters}).pipe(
      map(({success, dictionaries, cached = false}) => {
        let results = success ? dictionaries : [];
        if (cached && results.length > 0 && !this.utils.isObjectEmpty(parameters)) {
          if (!!parameters.lang) {
            results = results.filter((dictionary) => {
              return dictionary.language === parameters.lang;
            });
          }
          if (!!parameters.withLinks) {
            results = results.filter((dictionary) => {
              return dictionary.hasLinks === parameters.withLinks;
            });
          }
        }
        return results;
      }),
      tap((dictionaries) => {
        if (this.utils.isObjectEmpty(parameters)) {
          for (const dictionary of dictionaries) {
            this.cachedDictionaries.set(dictionary.id, dictionary);
          }
        }
      }),
      map((dictionaries) => {
        return dictionaries.map((dictionary) => {
          return {
            label: dictionary.title ?? '',
            value: dictionary,
            selected: false,
          }
        });
      }),
      tap((dictionaries) => {
        this.dictionaries = dictionaries;
      })
    );
  }

  searchDictionaries$(query: string): Observable<Dictionary.Result[]> {
    return this.listDictionaries$({}, this.route.snapshot).pipe(
      map((dictionaries) => {
        return dictionaries.filter(({label}) => {
          return label.includes(query);
        });
      }),
      map((dictionaries) => {
        return dictionaries.map(({value}) => {
          return value;
        });
      })
    )
  }

  findDictionaryByID$(query: string): Observable<Dictionary.Result | {}> {
    if (this.cachedDictionaries.has(query)) {
      return of(this.cachedDictionaries.get(query) || {}) as Observable<Dictionary.Result | {}>;
    }
    return this.listDictionaries$({}, this.route.snapshot).pipe(
      map((dictionaries) => {
        return dictionaries.find(({id}) => {
          return id === query;
        }) || {};
      }),
      tap((dictionary) => {
        if (this.utils.isDictionary(dictionary)) {
          this.cachedDictionaries.set(dictionary.id, dictionary);
        }
      }),
      catchError(() => of({})),
    )
  }

  prepareLanguageData$(route: ActivatedRouteSnapshot): Observable<Core.SelectableItem<Language.Result>[]> {
    const {sourceLanguage} = route.params;
    const {targetLanguage} = route.queryParams;
    this.targetLanguages = _.filter(!!targetLanguage ? _.cloneDeep(this.languages).map((item) => {
      item.selected = item.value.code === targetLanguage;
      return item;
    }) : _.cloneDeep(this.languages), (item) => {
      return _.includes(this.targetLanguageCodes, item.value.code);
    });
    this.sourceLanguages = !!sourceLanguage ? _.cloneDeep(this.languages).map((item) => {
      item.selected = item.value.code === sourceLanguage;
      return item;
    }) : _.cloneDeep(this.languages);
    return of(this.languages);
  }

  listLanguages$(): Observable<Core.SelectableItem<Language.Result>[]> {
    if (this.languages.length > 0) {
      return of(this.languages);
    }
    return this.httpClient.post<Language.ListResults>(this.apiUrl + "/api/listLang", this.defaultParameters ).pipe(
      map((response) => {
        const {success, languages} = response as unknown as Language.ListResults
        return success ? languages.map((item) => {
          item.title = item.language ?? item.code;
          return {
            label: item.title,
            selected: false,
            value: item,
          };
        }) : [];
      }),
      tap((languages) => {
        this.languages = languages;
      }),
      catchError(() => of([])),
    );
  }

  findLanguage$(code: string) {
    return this.listLanguages$().pipe(
      map((languages) => {
        return languages.find((language) => language.value.code === code);
      })
    );
  }

  private fetchSupportingLinks$(link: Link.RawResult, origin: Origin) {
    const parameters = {
      headword: _.get(link, origin + "Headword"),
      sourceDict: _.get(link, origin + "Dict"),
      sourceLanguage: _.get(link, origin + "Lang"),
    };
    return this.fetchLinks$(parameters).pipe(
      concatMap((supportingLinks: Link.RawResult[]) => {
        return this.updateLanguageLabels$(supportingLinks, origin);
      }),
      map((links) => {
        _.set(link, origin + "ConnectedLinks", links);
        return link;
      })
    );
  }

  private updateLanguageLabel$(link: Link.RawResult, origin: Origin) {
    _.set(this, origin + "LanguageCodes", [..._.get(this, origin + "LanguageCodes", []), _.get(link, origin + "Lang")]);
    this.targetLanguageCodes = [...this.targetLanguageCodes, link.targetLang];
    return this.findLanguage$(_.get(link, origin + "Lang")).pipe(
      map((language) => {
        _.set(link, origin + "LanguageObj", language);
        return link;
      })
    );
  }

  private updateLanguageLabels$(links: Link.RawResult[], origin: Origin) {
    return forkJoin(links.map((link) => this.updateLanguageLabel$(link, origin)));
  }

  private transformToSourceLink(link: Link.RawResult): Link.FormattedResult {
    return {
      id: link.sourceID,
      collection: {
        link: link.sourceURL,
        name: link.sourceDict
      },
      dictTitle: link.sourceDictTitle,
      description: link.sourceDescription,
      term: link.sourceHeadword,
    };
  }

  private transformToTargetLink(link: Link.RawResult): Link.FormattedResult {
    return {
      id: link.targetID,
      collection: {
        link: link.targetURL,
        name: link.targetDict
      },
      dictTitle: link.targetDictTitle,
      description: link.targetDescription,
      term: link.targetHeadword,
      similarity: link.targetSimilarity,
    };
  }

  private fetchLinks$(parameters: Link.Parameters): Observable<Link.RawResult[]> {
    const currentPathParameters = _.compact(_.values(_.pick(parameters, ["headword", "sourceLanguage", "sourceDict"])));
    const lastPathParameters = _.compact(_.values(this.lastPathParameters));
    if (_.every(currentPathParameters, (parameter) => _.includes(lastPathParameters, parameter)) && !_.isEmpty(this.rawLinks) && _.size(currentPathParameters) === _.size(lastPathParameters)) {
      return of(this.rawLinks);
    }
    return this.httpClient
      .post<Link.ListResults>(this.apiUrl + "/api/listLinks", {
        ...parameters,
        ...this.defaultParameters,
      })
      .pipe(
        map(({ success, links }) => {
          return success ? links : [];
        }),
        catchError(() => of([]))
      ) as Observable<Link.RawResult[]>;
  }

  private get defaultParameters(): Core.Parameters {
    return {
      email: this.email,
      apikey: this.apikey
    };
  }
}
