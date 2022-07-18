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
export class DataService implements Resolve<[Core.SelectableItem<Language.Result>[], Link.Result[]]> {
  sourceDictionaries: Core.SelectableItem<Dictionary.Result>[] = [];
  targetDictionaries: Core.SelectableItem<Dictionary.Result>[] = [];
  // Additional search parameters
  sourceDict!: string;
  targetLanguage!: string;
  targetDict!: string;
  similarity!: string;
  sourceLanguages: Core.SelectableItem<Language.Result>[] = [];
  targetLanguages: Core.SelectableItem<Language.Result>[] = [];
  sourceLanguageCodes: string[] = [];
  targetLanguageCodes: string[] = [];
  @LocalStorage() private languages: Core.SelectableItem<Language.Result>[] = [];
  @LocalStorage() private links: Link.Result[] = [];
  @LocalStorage() private rawLinks: Link.RawResult[] = [];
  @LocalStorage() private lastPathParameters!: Link.Parameters;
  private readonly apiUrl: API.URL;
  private readonly apikey: API.Key;
  private readonly email: API.Email;

  constructor(
    private httpClient: HttpClient,
    private localStorage: LocalStorageService,
    @Inject(ENVIRONMENT) environment: Environment,
  ) {
    this.apiUrl = environment?.api?.clientUrl ?? "";
    this.email = environment?.api?.email ?? "";
    this.apikey = environment?.api?.apiKey ?? "";
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<[Core.SelectableItem<Language.Result>[], Link.Result[]]> {
    return this.listLinks$(route).pipe(
      mergeMap((dictionaries) => {
        return forkJoin([
          this.listLanguages$().pipe(mergeMap(() => this.prepareLanguageData$(route))),
          of(dictionaries),
        ]).pipe(
          catchError(() => {
            return of([this.languages, this.links]) as Observable<[Core.SelectableItem<Language.Result>[], Link.Result[]]>;
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
    this.sourceDictionaries = [];
    this.targetDictionaries = [];
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
                const selectableItem = this.prepareSourceDictFromLink(link, sourceDict, true, link.sourceLang || pathParameters.sourceLanguage);
                this.sourceDictionaries = [...this.sourceDictionaries, selectableItem];
                return this.transformToSourceLink(link);
              });
            } else {
              const selectableItem = this.prepareSourceDictFromLink(link, sourceDict, false, link.sourceLang || pathParameters.sourceLanguage);
              this.sourceDictionaries = [...this.sourceDictionaries, selectableItem];
              result.source = [this.transformToSourceLink(link)];
            }
            // Transform it to meta data for dictionary, due to the fact it's lost otherwise
            if (link.targetDictConcept) {
              result.concept = this.transformToTargetLink(link)
              for (const targetConnectedLink of (link.targetConnectedLinks || []) ) {
                const selectableItem = this.prepareTargetDictFromLink(targetConnectedLink, targetDict, true, targetConnectedLink.targetLang);
                this.targetDictionaries = [...this.targetDictionaries, selectableItem];
              }
              this.targetLanguageCodes = _.uniq([...this.targetLanguageCodes, ..._.map(link.targetConnectedLinks, "targetLang")]);
            } else {
              const selectableItem = this.prepareTargetDictFromLink(link, targetDict, false, targetLanguage);
              this.targetDictionaries = [...this.targetDictionaries, selectableItem];
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

  prepareSourceDictFromLink(link: Link.RawResult, dict: string, hasLinks: boolean, lang?: string): Core.SelectableItem<Dictionary.Result> {
    return {
      label: link.sourceDictTitle,
      selected: link.sourceDict === dict,
      value: {
        id: link.sourceDict,
        title: link.sourceDictTitle,
        language: lang || null,
        hasLinks,
      }
    };
  }

  prepareTargetDictFromLink(link: Link.RawResult, dict: string, hasLinks: boolean, lang?: string): Core.SelectableItem<Dictionary.Result> {
    return {
      label: link.targetDictTitle,
      selected: link.targetDict === dict,
      value: {
        id: link.targetDict,
        title: link.targetDictTitle,
        language: lang || null,
        hasLinks,
      }
    };
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
        let {success, languages} = response as unknown as Language.ListResults
        languages = languages.filter(({code, language}) => code !== null && language !== null);
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
