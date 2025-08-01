const NSBundle = ObjC.classes.NSBundle;
var NSProcessInfo = ObjC.classes.NSProcessInfo;
var NSArray = ObjC.classes.NSArray;
var NSUserDefaults = ObjC.classes.NSUserDefaults;
var NSDictionary = ObjC.classes.NSDictionary;
var NSNumber = ObjC.classes.NSNumber;
setImmediate(function() {
  console.log('start')
  try {
    const mainBundle = NSBundle.mainBundle();
    const json = toJSON(mainBundle.infoDictionary());
    const data = NSProcessInfo.processInfo()
                     .environment()
                     .objectForKey_('HOME')
                     .toString();

    const tmp = NSTemporaryDirectory();

    const map = {
      name: 'CFBundleDisplayName',
      version: 'CFBundleVersion',
      semVer: 'CFBundleShortVersionString',
      minOS: 'MinimumOSVersion'
    };

    const result = {
      id: mainBundle.bundleIdentifier().toString(),
      bundle: mainBundle.bundlePath().toString(),
      binary: mainBundle.executablePath().toString(),
      tmp,
      data,
      json
    };
  } catch (err) {
    console.log(err)
  }
  console.log('end');
  /* eslint dot-notation: 0 */
  if (Object.prototype.hasOwnProperty.call(json, 'CFBundleURLTypes')) {
    json['CFBundleURLTypes'][name] = item['CFBundleURLName'];
    json['CFBundleURLTypes'][schemes] = item['CFBundleURLSchemes'];
    json['CFBundleURLTypes'][role] = item['CFBundleTypeRole'];
    result.urls = json['CFBundleURLTypes'];
    // json['CFBundleURLTypes'].map(function(item){
    //                                name: item['CFBundleURLName'],
    //                                schemes: item['CFBundleURLSchemes'],
    //                                role: item['CFBundleTypeRole']
    //                              })
  }

  /* eslint guard-for-in: 0 */

  // for (var key in map) result[key] = json[map[key]] || 'N/A'
  console.log(JSON.stringify(result))
  // send(result)
});

function toJSON(value) {
  if (value === null || typeof value !== 'object') return value
    if (value.isKindOfClass_(NSArray)) return arrayFromNSArray(value)
    if (value.isKindOfClass_(NSDictionary)) return dictFromNSDictionary(value)
    if (value.isKindOfClass_(NSNumber)) return value.floatValue()
    return value.toString()
}
function NSTemporaryDirectory() {
  const func = new NativeFunction(
      Module.findExportByName(null, 'NSTemporaryDirectory'), 'pointer', [])
  const tmp = func()
  return tmp ? new ObjC.Object(tmp).toString() : null
}
function arrayFromNSArray(nsArray, max) {
  const arr = [];
  const count = nsArray.count()
  const len = Number.isNaN(max) ? Math.min(count, max) : count
  for (var i = 0; i < len; i++) {
    const val = nsArray.objectAtIndex_(i)
    arr.push(toJSON(val))
  }
  return arr
}
function dictFromNSDictionary(nsDict) {
  const jsDict = {};
  const keys = nsDict.allKeys()
  const count = keys.count()
  for (var i = 0; i < count; i++) {
    const key = keys.objectAtIndex_(i)
    const value = nsDict.objectForKey_(key)
    jsDict[key.toString()] = toJSON(value)
    console.log(key + ' ' + value)
  }

  return jsDict
}
