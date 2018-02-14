# qarrr
> black flags, white skulls and rattlin zones

[![Build Status](https://travis-ci.org/seveves/qarrr.svg?branch=master)](https://travis-ci.org/seveves/qarrr)

Ahoy! 'tis a library wit' naught dependencies that generates nasty QR codes in yer browser as a Canvas element. Ay!

## Examples

### Basic Usage
```javascript
import qarrr from 'qarrr';

var q = new qarrr.QArrr();
var qrcd = q.create('QArrr!');
var canvas = q.toCanvas(qrcd);
document.body.appendChild(canvas);
```

### Frameworks
* [Angular](https://stackblitz.com/edit/angular-qarrr?ctl=1&embed=1&file=app/app.component.html&view=preview)


## Credits
* [Thonky QR Code Tutorial](https://www.thonky.com/qr-code-tutorial/introduction)
* [QRCoder C# Library](https://github.com/codebude/QRCoder)
