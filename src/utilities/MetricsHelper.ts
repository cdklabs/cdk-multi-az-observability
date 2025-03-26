import { Duration } from "aws-cdk-lib";
import { Color, Unit } from "aws-cdk-lib/aws-cloudwatch";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export class MetricsHelper {
  static readonly colors: string[] = [ Color.BLUE, Color.ORANGE, Color.GREEN, Color.RED, Color.BROWN, Color.PINK ];

  static readonly regionColor: string = Color.PURPLE;

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
  static nextChar(str?: string): string {
    if (!str || str.length == 0) {
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

  static isNotEmpty<T extends object>(obj: T | undefined | null): obj is T {
    return obj !== undefined && obj !== null && Object.keys(obj).length > 0;
  }

  public static convertDurationByUnit(duration: Duration, unit: Unit) {
    switch (unit) {
      case Unit.MICROSECONDS: {
        return duration.toMilliseconds() * 1000;
      }
      case Unit.MILLISECONDS: {
        return duration.toMilliseconds();
      }
      case Unit.SECONDS: {
        return duration.toSeconds({integral: false});
      }
      default: {
        throw new Error("Cannot convert duration to unit: " + unit.toString());
      }
    }
  }

  public static PythonRuntime: Runtime = Runtime.PYTHON_3_13;
}