export function readable(type, arg: NativePointer): string {
  let res: string = arg.toString();
  // console.log(type + ' ' + arg)
  switch (type) {
    case 'char *':
      try {
        res = arg.readUtf8String()
      } catch (err) {
        try {
          res = new ObjC.Object(arg).toString();
        } catch (ignore) {
          console.log(ignore)
        }
      }
      break;
    case 'Int32':
      res = arg.toInt32().toString();
      break;
    case 'pointer':
      try {
        res = arg.readUtf8String()
      } catch (ignore) {
        try {
          res = arg.readPointer().toString()
        } catch (ignore) {
          try {
            res = '\n' + hexdump(arg, {length: 64, header: true, ansi: true}) +
                '\n';
          } catch (ignore) {
            res = arg.toString();
          }
        }
      }
      break;
  }
  return res;
}

// %@	物件
// %%	% 字元
// %d, %D	有正負號 32 位元整數
// %u, %U	無正負號 32 位元整數
// %x	無正負號 32 位元整數，用小寫英文字母的十六進位印出
// %X	無正負號 32 位元整數，用大寫英文字母的十六進位印出
// %o, %O	無正負號 32 位元整數，用八六進位印出
// %f	64 位元浮點數
// %e	64 位元浮點數，用小寫英文字母的科學記號印出
// %E	64 位元浮點數，用大寫英文字母的科學記號印出
// %g	64 位元浮點數，同 %e 印出樣式，指數的絕對值小於或等於 4 便直接印出數字
// %G	64 位元浮點數，同 %E 印出樣式，指數的絕對值小於或等於 4 便直接印出數字
// %c	8 位元無正負號 ASCII 字元
// %C	16 位元無正負號 ASCII 字元
// %s	8 位元無正負號字元
// %S	16 位元 Unicode 字元
// %p	指標
// %a	64 位元浮點數，用 16 進位 (0x) 的科學記號印出
// %A	64 位元浮點數，用 16 進位 (0x) 的科學記號印出
// %F	64 位元浮點數