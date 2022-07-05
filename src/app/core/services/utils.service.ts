import { Injectable } from "@angular/core";
import isNil from "lodash-es/isNil";

@Injectable({ providedIn: "root" })
export class UtilsService {

  isString(item: any): item is string {
    return typeof item === "string";
  }

  shortenNumber(value: number | string, numLength: number = 3, defaultValue?: number | string) {
    if (isNil(value)) return defaultValue || 0;
    return parseFloat(parseFloat(value + "").toFixed(numLength));
  }

  isLanguage(item: any): item is Language.Result {
    return !!item?.code && !!item?.language;
  }

  isDictionary(item: any): item is Dictionary.Result {
    return !!item.title && !!item.language;
  }

  isObjectEmpty(obj: object) {
    return Object.keys(obj).length === 0;
  }

}
