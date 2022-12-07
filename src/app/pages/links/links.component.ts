import { Component, ViewChild, ElementRef, ChangeDetectionStrategy, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import get from "lodash-es/get";
import includes from "lodash-es/includes";
import { LocalStorage } from 'ngx-store';
import { DataService } from "src/app/core/services/data.service";

@Component({
  selector: 'links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss'],
})
export class LinksComponent implements AfterViewInit, OnInit {
  @ViewChild('stickyArea') stickyArea!: ElementRef;

  @LocalStorage() links: Link.Result[] = [];

  conceptView = false;
  shrink = false;
  faFilter = faFilter;

  constructor(
    public data: DataService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.conceptView = !!this.route.snapshot.queryParams["conceptView"];
    this.data.similarity = this.route.snapshot.queryParams["similarity"];
  }

  ngAfterViewInit(): void {
    let lastChange = 0;

    let observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          const now = Date.now();

          const tooQuickToChangeAgain = now - lastChange <= 100;
          const isShrinked = this.shrink;
          const tooSmallToBother =
            !isShrinked &&
            document.documentElement.scrollHeight / window.innerHeight < 1.3; // == if document height < 1.3vh

          if (!tooQuickToChangeAgain && !tooSmallToBother) {
            this.shrink = !entry.isIntersecting;
            lastChange = now;
          }
        });
      },
      { rootMargin: '-1px 0px 0px 0px', threshold: [1.0] }
    );

    observer.observe(this.stickyArea.nativeElement);
  }

  public emitSourceDictionarySearch(items: Dictionary.Result[]) {
    this.data.sourceDict = get(items, "[0].id");
    const queryParams: any = {};
    if (!!this.conceptView) {
      queryParams["conceptView"] = this.conceptView;
    }
    queryParams["sourceDict"] = this.data.sourceDict;
    if (!!this.data.targetDict) {
      queryParams["targetDict"] = this.data.targetDict;
    }
    if (!!this.data.targetLanguage) {
      queryParams["targetLanguage"] = this.data.targetLanguage;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }

  public emitLanguageSearch(items: Language.Result[]) {
    const codes = items.map(({code}) => code);
    for (const targetLanguage of this.data.targetLanguages) {
      targetLanguage.selected = includes(codes, targetLanguage.value.code);
    }
    this.data.targetLanguage = codes[0];
    const queryParams: any = {};
    if (!!this.conceptView) {
      queryParams["conceptView"] = this.conceptView;
    }
    queryParams["similarity"] = this.data.similarity;
    if (!!this.data.sourceDict) {
      queryParams["sourceDict"] = this.data.sourceDict;
    }
    if (!!this.data.targetDict) {
      queryParams["targetDict"] = this.data.targetDict;
    }
    queryParams["targetLanguage"] = this.data.targetLanguage;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }

  public emitTargetDictionarySearch(items: Dictionary.Result[]) {
    this.data.targetDict = get(items, "[0].id");
    const queryParams: any = {};
    queryParams["similarity"] = this.data.similarity;
    if (!!this.conceptView) {
      queryParams["conceptView"] = this.conceptView;
    }
    if (!!this.data.sourceDict) {
      queryParams["sourceDict"] = this.data.sourceDict;
    }
    queryParams["targetDict"] = this.data.targetDict;
    if (!!this.data.targetLanguage) {
      queryParams["targetLanguage"] = this.data.targetLanguage;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }

  public emitSimilaritySearch(items: Similarity.Result[]) {
    this.data.similarity = get(items, "[0]");
    const queryParams: any = {};
    if (!!this.conceptView) {
      queryParams["conceptView"] = this.conceptView;
    }
    queryParams["similarity"] = this.data.similarity;
    if (!!this.data.sourceDict) {
      queryParams["sourceDict"] = this.data.sourceDict;
    }
    if (!!this.data.targetDict) {
      queryParams["targetDict"] = this.data.targetDict;
    }
    if (!!this.data.targetLanguage) {
      queryParams["targetLanguage"] = this.data.targetLanguage;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }

  public emitConceptView(conceptView: boolean) {
    this.conceptView = conceptView;
    const queryParams: any = {};
    queryParams["conceptView"] = this.conceptView;
    queryParams["similarity"] = this.data.similarity;
    if (!!this.data.sourceDict) {
      queryParams["sourceDict"] = this.data.sourceDict;
    }
    if (!!this.data.targetDict) {
      queryParams["targetDict"] = this.data.targetDict;
    }
    if (!!this.data.targetLanguage) {
      queryParams["targetLanguage"] = this.data.targetLanguage;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {conceptView: this.conceptView},
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }

}
