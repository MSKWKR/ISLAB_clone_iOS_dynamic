/*
 * @enum		CCAlgorithm
 * @abstract	Encryption algorithms implemented by this module.
 * @constant	kCCAlgorithmAES128	Advanced Encryption Standard, 128-bit
 * block
 * @constant	kCCAlgorithmDES		Data Encryption Standard
 * @constant	kCCAlgorithm3DES	Triple-DES, three key, EDE configuration
 * @constant	kCCAlgorithmCAST	CAST
 * @constant	kCCAlgorithmRC4		RC4 stream cipher
 */
/*
        kCCKeySizeAES128	= 16,
        kCCKeySizeAES192	= 24,
        kCCKeySizeAES256	= 32,
        kCCKeySizeDES		  = 8,
        kCCKeySize3DES		= 24,
        kCCKeySizeMinCAST	= 5,
        kCCKeySizeMaxCAST	= 16,
        kCCKeySizeMinRC4	= 1,
        kCCKeySizeMaxRC4	= 512,
        kCCKeySizeMinRC2	= 1,
        kCCKeySizeMaxRC2	= 128
 */
setImmediate(function() {
  var stored_args;
  send('Hooked function %s');
  Interceptor.attach(
      Module.findExportByName('libcommonCrypto.dylib', 'CCCrypt'), {
        onEnter: function(args) {
          for (var arg in args) {
            console.log(arg);
          }
          this.operation = args[0];
          this.CCAlgorithm = args[1];
          this.CCOptions = args[2];
          this.keyBytes = args[3];
          this.keyLength = args[4];
          this.ivBuffer = args[5];
          this.inBuffer = args[6];
          this.inLength = args[7];
          this.outBuffer = args[8];
          this.outLength = args[9];
          this.outCountPtr = args[10];
          for (var i = 0; i < 11; i++) {
            stored_args += ' ' + args[i];
          }
          console.log(
              'CCCrypt(' +
              'operation: ' + this.operation + ', ' +
              'CCAlgorithm: ' + this.CCAlgorithm + ', ' +
              'CCOptions: ' + this.CCOptions + ', ' +
              'keyBytes: ' + this.keyBytes + ', ' +
              'keyLength: ' + this.keyLength + ', ' +
              'ivBuffer: ' + this.ivBuffer + ', ' +
              'inBuffer: ' + this.inBuffer + ', ' +
              'inLength: ' + this.inLength + ', ' +
              'outBuffer: ' + this.outBuffer + ', ' +
              'outLength: ' + this.outLength + ', ' +
              'outCountPtr: ' + this.outCountPtr + ')');
          if (this.operation == 0) {
            // Show the buffers here if this an encryption operation
            console.log('In buffer:')
            console.log(hexdump(
                ptr(this.inBuffer),
                {length: this.inLength.toInt32(), header: true, ansi: true}))
            console.log('Key: ')
            console.log(hexdump(
                ptr(this.keyBytes),
                {length: this.keyLength.toInt32(), header: true, ansi: true}))
            console.log('IV: ')
            console.log(hexdump(
                ptr(this.ivBuffer),
                {length: this.keyLength.toInt32(), header: true, ansi: true}))
          }
        },
        onLeave: function(retval) {
          if (this.operation == 1) {
            // Show the buffers here if this a decryption operation
            console.log('Out buffer:')
            console.log(hexdump(ptr(this.outBuffer), {
              length: Memory.readUInt(this.outCountPtr),
              header: true,
              ansi: true
            }))
            console.log('Key: ')
            console.log(hexdump(
                ptr(this.keyBytes),
                {length: this.keyLength.toInt32(), header: true, ansi: true}))
            console.log('IV: ')
            console.log(hexdump(
                ptr(this.ivBuffer),
                {length: this.keyLength.toInt32(), header: true, ansi: true}))
          }
          console.log('CCCrypt ' + retval + stored_args);
        }
      });
});

setImmediate(function() {
  var stored_args;
  send('Hooked function %s');
  Interceptor.attach(
      Module.findExportByName('libcommonCrypto.dylib', 'CCCryptorFinal'), {
        onEnter(args) {
          console.log('catch cryptorFinal');
        },
        onLeave(args) {}
      });
});
setImmediate(function() {
  var stored_args;
  send('Hooked function %s');
  Interceptor.attach(
      Module.findExportByName('libcommonCrypto.dylib', 'CCCryptorCreate'), {
        onEnter(args) {
          console.log(
              'catch cryptorCreate with ' + args[0] + ' ' + args[1] + ' ' +
              args[3] + ' ' + args[4] + ' ' + args[5]);
        },
        onLeave(args) {}
      });
});