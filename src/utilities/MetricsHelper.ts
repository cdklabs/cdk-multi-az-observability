export class MetricsHelper {
    /**
   * Increments a str by one char, for example
   * a -> b
   * z -> aa
   * ad -> ae
   *
   * This wraps at z and adds a new 'a'
   * @param str
   * @returns
   */
  static nextChar(str: string): string {
    if (str.length == 0) {
      return 'a';
    }
    let charA: string[] = str.split('');

    if (charA[charA.length - 1] === 'z') {
      return (
        MetricsHelper.nextChar(
          str.substring(0, charA.length - 1),
        ) + 'a'
      );
    } else {
      return (
        str.substring(0, charA.length - 1) +
        String.fromCharCode(charA[charA.length - 1].charCodeAt(0) + 1)
      );
    }
  }
}