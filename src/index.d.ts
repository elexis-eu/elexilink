declare interface Translation {
  id: number;
  collection: { link: string, name: string };
  description: string | undefined;
  term: string;
  similarity?: string;
}

declare namespace Core {
  interface Parameters {
    email: API.Email;
    apikey: API.Key;
  }
  interface BaseResponse {
    success: boolean;
  }
  interface LoginResponse extends BaseResponse {
    sessionkey?: string;
  }
  type BaseSelectableItem = Record<string, unknown>;
  interface SelectableItem<T=unknown> extends BaseSelectableItem {
    label: string;
    value: T;
    selected: boolean;
  }

}

declare namespace User {
  interface Information {
    loggedin: boolean;
    email: string;
    isAdmin: boolean;
    ske_username: string | null,
    ske_apiKey: string | null,
    apiKey: string;
    consent: boolean;
  }
}

declare namespace API {
  type Email = string;
  type Key = string;
  type URL = string;
  type UseCache = boolean;
}

declare namespace Similarity {
  interface Result {
    label: string;
    value: string;
    selected?: boolean;
  }
}

declare namespace Language {
  type Code = string;
  type Value = string | null;

  interface Result {
    code: Code;
    language: Value;
    title?: Value;
    selected?: boolean;
  }

  interface ListResults {
    languages: Result[];
    success: boolean;
    cached?: boolean;
  }
}

declare namespace Dictionary {
  type Id = string;
  type Title = string;
  type HasLinks = boolean;

  interface Parameters {
    lang?: string;
    withLinks?: boolean;
  }

  interface Result {
    id: Id;
    title: Title;
    language: Language.Code | null;
    hasLinks: HasLinks;
    selected?: boolean;
  }

  interface ListResults {
    dictionaries: Result[];
    success: boolean;
    cached?: boolean;
  }
}

declare namespace Link {
  type Value = string | null;

  interface Parameters {
    headword: string;
    sourceLanguage?: string;
    targetLanguage?: string;
    sourceDict?: string;
    targetDict?: string;
    similarity?: string;
  }

  interface RawResult {
    /**
     * If true then source dictionary is a meta dictionary.
     */
    sourceDictConcept?: boolean;
    sourceDict: string;
    sourceDictObj?: {} | Dictionary.Result;
    sourceHeadword: Value;
    sourceID: number | string;
    sourceSense: string;
    sourceURL: string;
    sourceDescription?: string;
    sourceLanguageObj?: Language.Result;
    sourceLang?: string;
    sourceDictTitle: string;
    targetDict: string;
    /**
     * If true then we are dealing with a meta dictionary.
     */
    targetDictConcept: boolean;
    targetDictObj?: {} | Dictionary.Result;
    targetLanguageObj?: Language.Result;
    confidence: number;
    targetLang: string;
    targetHeadword: string;
    targetDescription?: string;
    targetPreview?: string;
    targetSimilarity?: string;
    targetID: number;
    targetURL: string;
    targetDictTitle: string;
    sourceConnectedLinks?: Link.RawResult[];
    targetConnectedLinks?: Link.RawResult[];
  }

  interface FormattedResult {
    id: number | string;
    lang?: string;
    collection: { link: string, name: string };
    description: string | undefined;
    term: Value;
    dictTitle: string;
    similarity?: string;
  }

  interface Result {
    source: FormattedResult[];
    concept?: FormattedResult;
    target: FormattedResult[];
  }

  interface ListResults {
    links: Result[];
    success: boolean;
    cached?: boolean;
  }
}

