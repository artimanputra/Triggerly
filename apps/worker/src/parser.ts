export function parse(
    text: string,
    values: Record<string, any>,
    startDelimeter = "{",
    endDelimeter = "}"
  ): string {
    let startIndex = 0;
    let endIndex = 1;
    let finalString = "";
  
    while (endIndex < text.length) {
      if (text[startIndex] === startDelimeter) {
        let endPoint = startIndex + 1;
  
        while (text[endPoint] !== endDelimeter && endPoint < text.length) {
          endPoint++;
        }
  
        const stringHoldingValue = text.slice(startIndex + 1, endPoint);
        const keys = stringHoldingValue.split(".");
  
        let localValues: any = values;
        for (const key of keys) {
          // Safe access: only if localValues is a non-null object
          if (localValues !== null && typeof localValues === "object" && key in localValues) {
            localValues = localValues[key];
          } else {
            localValues = ""; // Or fallback to `{${stringHoldingValue}}`
            break;
          }
        }
  
        finalString += String(localValues);
        startIndex = endPoint + 1;
        endIndex = startIndex + 1;
      } else {
        finalString += text[startIndex];
        startIndex++;
        endIndex++;
      }
    }
  
    if (text[startIndex]) {
      finalString += text[startIndex];
    }
  
    return finalString;
  }
  