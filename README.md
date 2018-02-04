# qarrr
> black flags, white skulls and rattlin zones

Ahoy!
'tis a library wit' naught dependencies that generates nasty QR codes in yer browser as a Canvas element. Ay!

## Example
```javascript
import qarrr from 'qarrr';

var q = new qarrr.QArr();
var qrcd = q.create('QArr!');
var canvas = q.toCanvas(qrcd);
document.body.appendChild(canvas);
```

## Credits
* [Thonky QR Code Tutorial](https://www.thonky.com/qr-code-tutorial/introduction)
* [QRCoder C# Library](https://github.com/codebude/QRCoder)