(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
}); // Module.ensureInitialized('Foundation')

var classdump_1 = require("./ios/classdump");

var hook_1 = require("./ios/hook"); //import {app_transport_security, protected_resources_permissions, show_url_scheme, classes_potential_jailbreak_detection, methods_potential_jailbreak_detection} from './ios/static_analysis'


var static_analysis_1 = require("./ios/static_analysis");

rpc.exports = {
  getClass: function getClass() {
    return classdump_1.get_app_classes();
  },
  getMethod: function getMethod(class_name) {
    return classdump_1.get_class_method(class_name);
  },
  getModule: function getModule() {
    return classdump_1.get_module();
  },
  isMethodExists: function isMethodExists(class_name, method_name) {
    return classdump_1.is_method_exists(class_name, method_name);
  },
  getArguments: function getArguments(class_name, method_name) {
    return classdump_1.get_arguments(class_name, method_name);
  },
  getReturnType: function getReturnType(class_name, method_name) {
    return classdump_1.get_return_type(class_name, method_name);
  },
  hookMethod: function hookMethod(class_name, method_name, signature) {
    return hook_1.hook_specific_method_of_class(class_name, method_name, signature);
  },
  hook: function hook(library, func, signature) {
    return hook_1.hook(library, func, signature);
  },
  swizzle: function swizzle(class_name, method_name) {
    return hook_1.swizzle(class_name, method_name, false);
  },
  staticAnalysis: function staticAnalysis() {
    //   app_transport_security();
    //  protected_resources_permissions();
    static_analysis_1.show_url_scheme(); // classes_potential_jailbreak_detection();
    // methods_potential_jailbreak_detection();
  }
};

},{"./ios/classdump":3,"./ios/hook":4,"./ios/static_analysis":5,"@babel/runtime-corejs2/core-js/object/define-property":8,"@babel/runtime-corejs2/helpers/interopRequireDefault":9}],2:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});
exports.readable = void 0;

function readable(type, arg) {
  var res = arg.toString(); // console.log(type + ' ' + arg)

  switch (type) {
    case 'char *':
      try {
        res = arg.readUtf8String();
      } catch (err) {
        try {
          res = new ObjC.Object(arg).toString();
        } catch (ignore) {
          console.log(ignore);
        }
      }

      break;

    case 'Int32':
      res = arg.toInt32().toString();
      break;

    case 'pointer':
      try {
        res = arg.readUtf8String();
      } catch (ignore) {
        try {
          res = arg.readPointer().toString();
        } catch (ignore) {
          try {
            res = '\n' + hexdump(arg, {
              length: 64,
              header: true,
              ansi: true
            }) + '\n';
          } catch (ignore) {
            res = arg.toString();
          }
        }
      }

      break;
  }

  return res;
}

exports.readable = readable; // %@	物件
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

},{"@babel/runtime-corejs2/core-js/object/define-property":8,"@babel/runtime-corejs2/helpers/interopRequireDefault":9}],3:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});
exports.get_module_by_name = exports.get_module = exports.get_return_type = exports.get_arguments = exports.is_method_exists = exports.get_class_method = exports.get_app_classes = void 0;

function get_app_classes() {
  var free = new NativeFunction(Module.findExportByName(null, 'free'), 'void', ['pointer']);
  var copyClassNamesForImage = new NativeFunction(Module.findExportByName(null, 'objc_copyClassNamesForImage'), 'pointer', ['pointer', 'pointer']);
  var p = Memory.alloc(Process.pointerSize);
  p.writeInt(0);
  var path = ObjC.classes.NSBundle.mainBundle().executablePath().UTF8String();
  var pPath = Memory.allocUtf8String(path);
  var pClasses = copyClassNamesForImage(pPath, p);
  var count = p.readUInt();
  var classesArray = new Array(count);

  for (var i = 0; i < count; i++) {
    var pClassName = ptr(pClasses.toString()).add(i * Process.pointerSize).readPointer();
    classesArray[i] = pClassName.readUtf8String();
  }

  free(pClasses);
  return classesArray;
}

exports.get_app_classes = get_app_classes;

function get_class_method(class_name) {
  var methods = ObjC.classes[class_name].$ownMethods;
  send(ObjC.classes[class_name]);

  for (var j = 0; j < methods.length; j++) {
    send(methods[j]);
  }

  return methods;
}

exports.get_class_method = get_class_method;

function is_method_exists(class_name, method_name) {
  try {
    ObjC.classes[class_name][method_name].$ownMethods;
    return true;
  } catch (error) {
    console.log("[".concat(class_name, "] [").concat(method_name, "] doesn't exists"));
    return false;
  }
}

exports.is_method_exists = is_method_exists;

function get_arguments(class_name, method_name) {
  return ObjC.classes[class_name][method_name].argumentTypes;
}

exports.get_arguments = get_arguments;

function get_return_type(class_name, method_name) {
  return ObjC.classes[class_name][method_name].returnType;
}

exports.get_return_type = get_return_type;

function get_module() {
  var list = Process.enumerateModules();

  for (var i = 0; i < list.length; i++) {
    send(list[i].enumerateExports());
  }

  return Process.enumerateModules();
}

exports.get_module = get_module;

function get_module_by_name(module_name) {
  return Process.getModuleByName(module_name).enumerateSymbols();
}

exports.get_module_by_name = get_module_by_name;

},{"@babel/runtime-corejs2/core-js/object/define-property":8,"@babel/runtime-corejs2/helpers/interopRequireDefault":9}],4:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});
exports.hook = exports.hook_specific_method_of_class = exports.swizzle = void 0;

var timstamp_1 = require("../utils/timstamp");

var argparser_1 = require("./argparser");

function swizzle(class_name, sel, trace_result) {
  var hook = ObjC.classes[class_name][sel];

  try {
    var onLeave;

    if (trace_result) {
      onLeave = function onLeave(retVal) {
        var ret = retVal;

        try {
          ret = new ObjC.Object(ret).toString();
          console.log(ret);
        } catch (ignored) {}
      };
    }

    Interceptor.attach(hook.implementation, {
      onEnter: function onEnter(args) {
        var readableArgs = [];

        try {
          for (var i = 2; i < hook.argumentTypes.length; i++) {
            if (hook.argumentTypes[i] === 'pointer') {
              try {
                var obj = new ObjC.Object(args[i]).toString();
                readableArgs.push(obj);
              } catch (ex) {
                readableArgs.push(args[i]);
              }
            } else {
              readableArgs.push(args[i]);
            }
          }
        } catch (err) {
          console.log(err);
        }

        var backtrace = Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n\t').toString();
        var res = {
          'time': timstamp_1.get_timestamp(),
          'lib': class_name,
          'func': sel,
          'args': readableArgs
        };
        console.log("[".concat(res['time'], "] [").concat(class_name, "] [").concat(sel, "] [").concat(readableArgs, "]"));
        send((0, _stringify["default"])(res)); // send(`[${get_timestamp()}] [${class_name}] [${sel}]
        // [${readableArgs}]`) console.log('Backtrace:\n\t' + backtrace);
      },
      onLeave: onLeave
    });
  } catch (err) {
    console.log("[".concat(timstamp_1.get_timestamp(), "] Error while hook ").concat(class_name, " ").concat(sel, " with message ").concat(err));
  }
}

exports.swizzle = swizzle;

function hook_specific_method_of_class(className, funcName, signature) {
  var hook = ObjC.classes[className][funcName];

  try {
    if (hook === undefined) return;
    Interceptor.attach(hook.implementation, {
      onEnter: function onEnter(args) {
        var pretty = [];

        for (var i = 0; i < signature.args.length; i++) {
          var arg = args[i];
          pretty[i] = argparser_1.readable(signature.args[i], arg);
        } // userDidTakeScreenshotNotification


        var backtrace = Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n\t').toString();
        var res = {
          'time': timstamp_1.get_timestamp(),
          'lib': className,
          'func': funcName,
          'args': pretty
        };
        console.log("[".concat(res['time'], "] [").concat(res['lib'], "] [").concat(res['func'], "] [").concat(res['args'], "]"));
        send((0, _stringify["default"])(res)); // console.log('Backtrace:\n\t' + backtrace);
      }
    });
  } catch (err) {
    console.log("[".concat(timstamp_1.get_timestamp(), "] Error while hook ").concat(className, " ").concat(funcName, " with message ").concat(err));
  }
}

exports.hook_specific_method_of_class = hook_specific_method_of_class;

function hook(library, func, signature) {
  var funcPtr = Module.findExportByName(library, func);

  if (!funcPtr) {
    console.log('symbol not found');
    return;
  }

  try {
    Interceptor.attach(funcPtr, {
      onEnter: function onEnter(args) {
        var pretty = [];

        for (var i = 0; i < signature.args.length; i++) {
          var arg = args[i];
          pretty[i] = argparser_1.readable(signature.args[i], arg);
        }

        var backtrace = Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).toString();
        var res = {
          'time': timstamp_1.get_timestamp(),
          'lib': library,
          'func': func,
          'args': pretty
        };
        console.log("[".concat(res['time'], "] [").concat(res['lib'], "] [").concat(res['func'], "] [").concat(res['args'], "]"));
        send((0, _stringify["default"])(res)); // send(`[${get_timestamp()}] [${library}] [${func}] [${pretty}]`);
        // console.log(backtrace.replace(/,/g, '\n'));
      }
    });
  } catch (err) {
    console.log("[".concat(timstamp_1.get_timestamp(), "] Error while hook ").concat(library, " ").concat(func, " with message ").concat(err));
  }
}

exports.hook = hook;

},{"../utils/timstamp":6,"./argparser":2,"@babel/runtime-corejs2/core-js/json/stringify":7,"@babel/runtime-corejs2/core-js/object/define-property":8,"@babel/runtime-corejs2/helpers/interopRequireDefault":9}],5:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});
exports.show_url_scheme = void 0;

var timstamp_1 = require("../utils/timstamp");

var NSBundle = ObjC.classes.NSBundle;

function get_metadata() {
  /*
   * CFBundleName
   * CFBundleDisplayName
   * CFBundleExecutable
   * CFBundleIdentifier
   * CFBundleInfoDictionaryVersion
   * CFBundleNumericVersion
   * CFBundleShortVersionString
   * CFBundleVersion
   * MinimumOSVersion
   * CFBundlePackageType
   * BuildMachineOSBuild
   * CFBundleDevelopmentRegion
   * LSRequiresIPhoneOS
   */
  var metadata = NSBundle.mainBundle().infoDictionary();
}

function show_url_scheme() {
  var nsDictionary = ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_('CFBundleURLTypes');

  if (nsDictionary == null) {
    //console.log('[*] URL scheme not defined by app')
    return;
  } //console.log(nsDictionary);


  nsDictionary = nsDictionary.objectAtIndex_(0);
  var dictKeys = nsDictionary.allKeys();
  var url_name;

  for (var i = 0; i < dictKeys.count(); i++) {
    if (dictKeys.objectAtIndex_(i) == 'CFBundleURLName') {
      var key = dictKeys.objectAtIndex_(i);
      url_name = nsDictionary.objectForKey_(key);
    } else url_name = "";
  }

  for (var j = 0; j < dictKeys.count(); j++) {
    if (dictKeys.objectAtIndex_(j) == 'CFBundleURLSchemes') {
      var urlSchemesString = '';
      var nsArray = nsDictionary.objectForKey_('CFBundleURLSchemes');

      for (var k = 0; k < nsArray.count(); k++) {
        urlSchemesString = nsArray.objectAtIndex_(k);
        urlSchemesString += "://";
        urlSchemesString += url_name;
        var res = {
          'time': timstamp_1.get_timestamp(),
          'lib': 'Infoplist',
          'func': 'CFBundleURLTypes',
          'args': urlSchemesString
        };
        console.log("[".concat(res['time'], "] [").concat(res['lib'], "] [").concat(res['func'], "] [").concat(res['args'], "]"));
        send((0, _stringify["default"])(res));
      }
    }
    /*else if (dictKeys.objectAtIndex_(i) == 'CFBundleURLIconFile') {
      var key = dictKeys.objectAtIndex_(i);
      var value = nsDictionary.objectForKey_(key);
      console.log('URL Icon File : ' + value)
    } else if (dictKeys.objectAtIndex_(i) == 'CFBundleTypeRole') {
      var key = dictKeys.objectAtIndex_(i);
      var value = nsDictionary.objectForKey_(key);
      console.log('App\'s Role : ' + value)
    } else {
      var key = dictKeys.objectAtIndex_(i);
      var value = nsDictionary.objectForKey_(key);
      console.log(key + ' : ' + value)
    }*/

  }
}

exports.show_url_scheme = show_url_scheme;
/*export function protected_resources_permissions() {
  let dictKeys = ObjC.classes.NSBundle.mainBundle().infoDictionary().allKeys();
  const permissionListArray = [
    'NSBluetoothAlwaysUsageDescription',
    'NSBluetoothPeripheralUsageDescription',
    'NSCalendarsUsageDescription',
    'NSRemindersUsageDescription',
    'NSCameraUsageDescription',
    'NSMicrophoneUsageDescription',
    'NSContactsUsageDescription',
    'NSFaceIDUsageDescription',
    'NSDesktopFolderUsageDescription',
    'NSDocumentsFolderUsageDescription',
    'NSDownloadsFolderUsageDescription',
    'NSNetworkVolumesUsageDescription',
    'NSRemovableVolumesUsageDescription',
    'NSFileProviderPresenceUsageDescription',
    'NSFileProviderDomainUsageDescription',
    'NSHealthClinicalHealthRecordsShareUsageDescription',
    'NSHealthShareUsageDescription',
    'NSHealthUpdateUsageDescription',
    'NSHealthRequiredReadAuthorizationTypeIdentifiers',
    'NSHomeKitUsageDescription',
    'NSLocationAlwaysAndWhenInUseUsageDescription',
    'NSLocationUsageDescription',
    'NSLocationWhenInUseUsageDescription',
    'NSLocationAlwaysUsageDescription',
    'NSAppleMusicUsageDescription',
    'NSMotionUsageDescription',
    'NFCReaderUsageDescription',
    'NSPhotoLibraryAddUsageDescription',
    'NSPhotoLibraryUsageDescription',
    'NSAppleScriptEnabled',
    'NSAppleEventsUsageDescription',
    'NSSystemAdministrationUsageDescription',
    'ITSAppUsesNonExemptEncryption',
    'ITSEncryptionExportComplianceCode',
    'NSSiriUsageDescription',
    'NSSpeechRecognitionUsageDescription',
    'NSVideoSubscriberAccountUsageDescription',
    'UIRequiresPersistentWiFi'
  ];
  const permissionListNameDict = {
    'NSBluetoothAlwaysUsageDescription':
        'Privacy - Bluetooth Always Usage Description',
    'NSBluetoothPeripheralUsageDescription':
        'Privacy - Bluetooth Peripheral Usage Description',
    'NSCalendarsUsageDescription': 'Privacy - Calendars Usage Description',
    'NSRemindersUsageDescription': 'Privacy - Reminders Usage Description',
    'NSCameraUsageDescription': 'Privacy - Camera Usage Description',
    'NSMicrophoneUsageDescription': 'Privacy - Microphone Usage Description',
    'NSContactsUsageDescription': 'Privacy - Contacts Usage Description',
    'NSFaceIDUsageDescription': 'Privacy - Face ID Usage Description',
    'NSDesktopFolderUsageDescription':
        'Privacy - Desktop Folder Usage Description',
    'NSDocumentsFolderUsageDescription':
        'Privacy - Documents Folder Usage Description',
    'NSDownloadsFolderUsageDescription':
        'Privacy - Downloads Folder Usage Description',
    'NSNetworkVolumesUsageDescription':
        'Privacy - Network Volumes Usage Description',
    'NSRemovableVolumesUsageDescription':
        'Privacy - Removable Volumes Usage Description',
    'NSFileProviderPresenceUsageDescription':
        'Privacy - File Provider Presence Usage Description',
    'NSFileProviderDomainUsageDescription':
        'Privacy - Access to a File Provider Domain Usage Description',
    'NSHealthClinicalHealthRecordsShareUsageDescription':
        'Privacy - Health Records Usage Description',
    'NSHealthShareUsageDescription': 'Privacy - Health Share Usage Description',
    'NSHealthUpdateUsageDescription':
        'Privacy - Health Update Usage Description',
    'NSHealthRequiredReadAuthorizationTypeIdentifiers':
        'The clinical record data types that your app must get permission to read.',
    'NSHomeKitUsageDescription': 'Privacy - HomeKit Usage Description',
    'NSLocationAlwaysAndWhenInUseUsageDescription':
        'Privacy - Location Always and When In Use Usage Description',
    'NSLocationUsageDescription': 'Privacy - Location Usage Description',
    'NSLocationWhenInUseUsageDescription':
        'Privacy - Location When In Use Usage Description',
    'NSLocationAlwaysUsageDescription':
        'Privacy - Location Always Usage Description',
    'NSAppleMusicUsageDescription': 'Privacy - Media Library Usage Description',
    'NSMotionUsageDescription': 'Privacy - Motion Usage Description',
    'NFCReaderUsageDescription': 'Privacy - NFC Scan Usage Description',
    'NSPhotoLibraryAddUsageDescription':
        'Privacy - Photo Library Additions Usage Description',
    'NSPhotoLibraryUsageDescription':
        'Privacy - Photo Library Usage Description',
    'NSAppleScriptEnabled': 'Scriptable',
    'NSAppleEventsUsageDescription':
        'Privacy - AppleEvents Sending Usage Description',
    'NSSystemAdministrationUsageDescription':
        'Privacy - System Administration Usage Description',
    'ITSAppUsesNonExemptEncryption': 'App Uses Non-Exempt Encryption',
    'ITSEncryptionExportComplianceCode':
        'App Encryption Export Compliance Code',
    'NSSiriUsageDescription': 'Privacy - Siri Usage Description',
    'NSSpeechRecognitionUsageDescription':
        'Privacy - Speech Recognition Usage Description',
    'NSVideoSubscriberAccountUsageDescription':
        'Privacy - Video Subscriber Account Usage Description',
    'UIRequiresPersistentWiFi': 'Application uses Wi-Fi'
  };
  const permissionListDetailDict = {
    'NSBluetoothAlwaysUsageDescription':
        'A message that tells the user why the app needs access to Bluetooth',
    'NSBluetoothPeripheralUsageDescription':
        'A message that tells the user why the app is requesting the ability to connect to Bluetooth peripherals',
    'NSCalendarsUsageDescription':
        'A message that tells the user why the app is requesting access to the user’s calendar data',
    'NSRemindersUsageDescription':
        'A message that tells the user why the app is requesting access to the user’s reminders',
    'NSCameraUsageDescription':
        'A message that tells the user why the app is requesting access to the device’s camera',
    'NSMicrophoneUsageDescription':
        'A message that tells the user why the app is requesting access to the device’s microphone',
    'NSContactsUsageDescription':
        'A message that tells the user why the app is requesting access to the user’s contacts',
    'NSFaceIDUsageDescription':
        'A message that tells the user why the app is requesting the ability to authenticate with Face ID',
    'NSDesktopFolderUsageDescription':
        'A message that tells the user why the app needs access to the user’s Desktop folder',
    'NSDocumentsFolderUsageDescription':
        'A message that tells the user why the app needs access to the user’s Documents folder',
    'NSDownloadsFolderUsageDescription':
        'A message that tells the user why the app needs access to the user’s Downloads folder',
    'NSNetworkVolumesUsageDescription':
        'A message that tells the user why the app needs access to files on a network volume',
    'NSRemovableVolumesUsageDescription':
        'A message that tells the user why the app needs access to files on a removable volume',
    'NSFileProviderPresenceUsageDescription':
        'A message that tells the user why the app needs to be informed when other apps access files that it manages',
    'NSFileProviderDomainUsageDescription':
        'A message that tells the user why the app needs access to files managed by a file provider',
    'NSHealthClinicalHealthRecordsShareUsageDescription':
        'A message to the user that explains why the app requested permission to read clinical records',
    'NSHealthShareUsageDescription':
        'A message to the user that explains why the app requested permission to read samples from the HealthKit store',
    'NSHealthUpdateUsageDescription':
        'A message to the user that explains why the app requested permission to save samples to the HealthKit store',
    'NSHealthRequiredReadAuthorizationTypeIdentifiers':
        'The clinical record data types that your app must get permission to read',
    'NSHomeKitUsageDescription':
        'A message that tells the user why the app is requesting access to the user’s HomeKit configuration data',
    'NSLocationAlwaysAndWhenInUseUsageDescription':
        'A message that tells the user why the app is requesting access to the user’s location information at all times',
    'NSLocationUsageDescription':
        'A message that tells the user why the app is requesting access to the user’s location information',
    'NSLocationWhenInUseUsageDescription':
        'A message that tells the user why the app is requesting access to the user’s location information while the app is running in the foreground',
    'NSLocationAlwaysUsageDescription':
        'A message that tells the user why the app is requesting access to the user\'s location at all times',
    'NSAppleMusicUsageDescription':
        'A message that tells the user why the app is requesting access to the user’s media library',
    'NSMotionUsageDescription':
        'A message that tells the user why the app is requesting access to the device’s accelerometer',
    'NFCReaderUsageDescription':
        'A message that tells the user why the app is requesting access to the device’s NFC hardware',
    'NSPhotoLibraryAddUsageDescription':
        'A message that tells the user why the app is requesting write-only access to the user’s photo library',
    'NSPhotoLibraryUsageDescription':
        'A message that tells the user why the app is requesting access to the user’s photo library',
    'NSAppleScriptEnabled':
        'A Boolean value indicating whether AppleScript is enabled',
    'NSAppleEventsUsageDescription':
        'A message that tells the user why the app is requesting the ability to send Apple events',
    'NSSystemAdministrationUsageDescription':
        'A message in macOS that tells the user why the app is requesting to manipulate the system configuration',
    'ITSAppUsesNonExemptEncryption':
        'A Boolean value indicating whether the app uses encryption',
    'ITSEncryptionExportComplianceCode':
        'The export compliance code provided by App Store Connect for apps that require it',
    'NSSiriUsageDescription':
        'A message that tells the user why the app is requesting to send user data to Siri',
    'NSSpeechRecognitionUsageDescription':
        'A message that tells the user why the app is requesting to send user data to Apple’s speech recognition servers',
    'NSVideoSubscriberAccountUsageDescription':
        'A message that tells the user why the app is requesting access to the user’s TV provider account',
    'UIRequiresPersistentWiFi':
        'A Boolean value indicating whether the app requires a Wi-Fi connection'
  };
  for (let i = 0; i < permissionListArray.length; i++) {
    try {
      if (dictKeys.containsObject_(permissionListArray[i])) {
        console.log('Resource : ' + permissionListArray[i])
        console.log(
            'Name     : ' + permissionListNameDict[permissionListArray[i]])
        console.log(
            'Details  : ' + permissionListDetailDict[permissionListArray[i]])
        console.log(
            'Value    : ' +
            ObjC.classes.NSBundle.mainBundle()
                .infoDictionary()
                .objectForKey_(permissionListArray[i])
                .toString())
        console.log('')
      }
    } catch (err) {
      console.log(err)
    }
  }
}
export function app_transport_security() {
  var dictKeys = ObjC.classes.NSBundle.mainBundle().infoDictionary().allKeys();
  if (dictKeys.containsObject_('NSAppTransportSecurity')) {
    console.log(
        '[*] Issue: Found \'NSAppTransportSecurity\' defined in Info.plist file')
    console.log(
        '[*] Detail: A description of changes made to the default security for HTTP connections')
    console.log('')
    var atsDictKeys = ObjC.classes.NSBundle.mainBundle()
                          .infoDictionary()
                          .objectForKey_('NSAppTransportSecurity')
                          .allKeys();
    for (let i = 0; i < atsDictKeys.count(); i++) {
      if (atsDictKeys.objectAtIndex_(i) == 'NSAllowsArbitraryLoads') {
        if (ObjC.classes.NSBundle.mainBundle()
                .infoDictionary()
                .objectForKey_('NSAppTransportSecurity')
                .objectForKey_('NSAllowsArbitraryLoads')
                .toString() == '1') {
          console.log(
              '[*] Issue: ATS restrictions dsiabled for all network connections by setting \'NSAllowsArbitraryLoads\' to True')
          console.log(
              '[*] Detail: A Boolean value indicating whether App Transport Security restrictions are disabled for all network connections')
          console.log(
              '[*] Description: Setting this key\'s value to YES disables App Transport Security (ATS) restrictions for all domains not specified in the NSExceptionDomains dictionary. Disabling ATS means that unsecured HTTP connections are allowed. HTTPS connections are also allowed, and are still subject to default server trust evaluation. However, extended security checks—like requiring a minimum Transport Layer Security (TLS) protocol version—are disabled. In iOS 10 and later, the value of the NSAllowsArbitraryLoads key is ignored and the default value of NO is used instead — if any of the following keys are present in app\'s Information Property List file: NSAllowsArbitraryLoadsForMedia, NSAllowsArbitraryLoadsInWebContent, NSAllowsLocalNetworking.')
          console.log('')
        }
      }
      if (atsDictKeys.objectAtIndex_(i) == 'NSAllowsArbitraryLoadsForMedia') {
        if (ObjC.classes.NSBundle.mainBundle()
                .infoDictionary()
                .objectForKey_('NSAppTransportSecurity')
                .objectForKey_('NSAllowsArbitraryLoadsForMedia')
                .toString() == '1') {
          console.log(
              '[*] Issue: ATS restrictions disabled for requests made using the AV Foundation framework by setting \'NSAllowsArbitraryLoadsForMedia\' to True')
          console.log(
              '[*] Detail: A Boolean value indicating whether all App Transport Security restrictions are disabled for requests made using the AV Foundation framework')
          console.log(
              '[*] Description: Setting this key\'s value to disables App Transport Security restrictions for media loaded using the AVFoundation framework, without affecting URLSession connections. Domains specified in the NSExceptionDomains dictionary aren\'t affected by this key\'s value. In iOS 10 and later, if this key is included with any value, then App Transport Security ignores the value of the NSAllowsArbitraryLoads key, instead using that key\'s default value of NO.')
          console.log('')
        }
      }
      if (atsDictKeys.objectAtIndex_(i) ==
          'NSAllowsArbitraryLoadsInWebContent') {
        if (ObjC.classes.NSBundle.mainBundle()
                .infoDictionary()
                .objectForKey_('NSAppTransportSecurity')
                .objectForKey_('NSAllowsArbitraryLoadsInWebContent')
                .toString() == '1') {
          console.log(
              '[*] Issue: ATS restrictions disabled for requests made from webviews by setting \'NSAllowsArbitraryLoadsInWebContent\' to True')
          console.log(
              '[*] Detail: A Boolean value indicating whether all App Transport Security restrictions are disabled for requests made from web views')
          console.log(
              '[*] Description: Setting this key\'s value to YES to exempt app\'s web views from App Transport Security restrictions without affecting URLSession connections. Domains specified in the NSExceptionDomains dictionary aren\'t affected by this key\'s value. A web view is an instance of any of the following classes: WKWebView and UIWebView. In iOS 10 and later, if this key is included with any value, then App Transport Security ignores the value of the NSAllowsArbitraryLoads key, instead using that key\'s default value of NO.')
          console.log('')
        }
      }
      if (atsDictKeys.objectAtIndex_(i) == 'NSAllowsLocalNetworking') {
        if (ObjC.classes.NSBundle.mainBundle()
                .infoDictionary()
                .objectForKey_('NSAppTransportSecurity')
                .objectForKey_('NSAllowsLocalNetworking')
                .toString() == '1') {
          console.log(
              '[*] Issue: Allowed Loading of Local Resources by setting \'NSAllowsLocalNetworking\' to True')
          console.log(
              '[*] Detail: A Boolean value indicating whether to allow loading of local resources.')
          console.log(
              '[*] Description: In iOS 9, App Transport Security (ATS) disallows connections to unqualified domains, .local domains, and IP addresses. Exceptions can be added for unqualified domains and .local domains in the NSExceptionDomains dictionary, but can’t add numerical IP addresses. Instead use NSAllowsArbitraryLoads when you want to load directly from an IP address. In iOS 10 later, ATS allows all three of these connections by default, so an exception is no longer needed for any of them. However, if compatibility with older versions of the OS is to be maintained, set both of the NSAllowsArbitraryLoads and NSAllowsLocalNetworking keys to YES.')
          console.log('')
        }
      }
      if (atsDictKeys.objectAtIndex_(i) == 'NSExceptionDomains') {
        console.log(
            '[*] Issue: Found \'NSExceptionDomains\' defined inside \'NSAppTransportSecurity\' in Info.plist file')
        console.log(
            '[*] Detail: Custom configurations for App Transport Security named domains')
        console.log('')
        var atsExceptionDomainsDict =
            ObjC.classes.NSBundle.mainBundle()
                .infoDictionary()
                .objectForKey_('NSAppTransportSecurity')
                .objectForKey_('NSExceptionDomains');
        var atsExceptionDomainsDictKeys =
            ObjC.classes.NSBundle.mainBundle()
                .infoDictionary()
                .objectForKey_('NSAppTransportSecurity')
                .objectForKey_('NSExceptionDomains')
                .allKeys();
        for (let j = 0; j < atsExceptionDomainsDictKeys.count(); j++) {
          console.log('Domain Name : ' + atsExceptionDomainsDict);
          if (ObjC.classes.NSBundle.mainBundle()
                  .infoDictionary()
                  .objectForKey_('NSAppTransportSecurity')
                  .objectForKey_('NSAllowsArbitraryLoads')
                  .toString() == '1') {
            console.log('[*] Issue: ')
            console.log('[*] Detail: ')
            console.log('[*] Description: ')
            console.log('')
          }
        }
      }
    }
  }
}
export function classes_potential_jailbreak_detection() {
  console.log('')
  console.warn('---------------------------------------------')
  console.warn('| Classes for potential jailbreak detection |')
  console.warn('---------------------------------------------')
  for (var className in ObjC.classes) {
    if (ObjC.classes.hasOwnProperty(className)) {
      var classNameLower = className.toLowerCase();
      if (classNameLower.indexOf('jailbreak') != -1 ||
          classNameLower.indexOf('jailbroke') != -1) {
        console.log(className);
        var methods = ObjC.classes[className].$ownMethods;
        for (var i = 0; i < methods.length; i++) {
          console.log('\t' + methods[i]);
        }
        console.log('')
      }
    }
  }
}
export function methods_potential_jailbreak_detection() {
  console.log('')
  console.warn('---------------------------------------------')
  console.warn('| Methods for potential jailbreak detection |')
  console.warn('---------------------------------------------')
  for (var className in ObjC.classes) {
    if (ObjC.classes.hasOwnProperty(className)) {
      var foundMethods = [];
      var j = 0;
      var methods = ObjC.classes[className].$ownMethods;
      for (var i = 0; i < methods.length; i++) {
        var methodNameLowerCase = methods[i].toLowerCase();
        if (methodNameLowerCase.indexOf('jailbreak') != -1 ||
            methodNameLowerCase.indexOf('jailbroke') != -1) {
          foundMethods[j] = methods[i];
          j++;
        }
      }
      if (foundMethods.length > 0) {
        console.log(className);
        for (var i = 0; i < foundMethods.length; i++) {
          console.log('\t' + foundMethods[i])
        }
        console.log('')
      }
    }
  }
}
*/

},{"../utils/timstamp":6,"@babel/runtime-corejs2/core-js/json/stringify":7,"@babel/runtime-corejs2/core-js/object/define-property":8,"@babel/runtime-corejs2/helpers/interopRequireDefault":9}],6:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});
exports.get_timestamp = void 0;

function get_timestamp() {
  var today = new Date();
  var timestamp = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + ' ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds() + ':' + today.getMilliseconds();
  return timestamp;
}

exports.get_timestamp = get_timestamp;

},{"@babel/runtime-corejs2/core-js/object/define-property":8,"@babel/runtime-corejs2/helpers/interopRequireDefault":9}],7:[function(require,module,exports){
module.exports = require("core-js/library/fn/json/stringify");
},{"core-js/library/fn/json/stringify":10}],8:[function(require,module,exports){
module.exports = require("core-js/library/fn/object/define-property");
},{"core-js/library/fn/object/define-property":11}],9:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],10:[function(require,module,exports){
var core = require('../../modules/_core');
var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};

},{"../../modules/_core":14}],11:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};

},{"../../modules/_core":14,"../../modules/es6.object.define-property":28}],12:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],13:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":24}],14:[function(require,module,exports){
var core = module.exports = { version: '2.6.11' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],15:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":12}],16:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":19}],17:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":20,"./_is-object":24}],18:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var ctx = require('./_ctx');
var hide = require('./_hide');
var has = require('./_has');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":14,"./_ctx":15,"./_global":20,"./_has":21,"./_hide":22}],19:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],20:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],21:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],22:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":16,"./_object-dp":25,"./_property-desc":26}],23:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":16,"./_dom-create":17,"./_fails":19}],24:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],25:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":13,"./_descriptors":16,"./_ie8-dom-define":23,"./_to-primitive":27}],26:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],27:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":24}],28:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperty: require('./_object-dp').f });

},{"./_descriptors":16,"./_export":18,"./_object-dp":25}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9pbmRleC50cyIsImFnZW50L2lvcy9hcmdwYXJzZXIudHMiLCJhZ2VudC9pb3MvY2xhc3NkdW1wLnRzIiwiYWdlbnQvaW9zL2hvb2sudHMiLCJhZ2VudC9pb3Mvc3RhdGljX2FuYWx5c2lzLnRzIiwiYWdlbnQvdXRpbHMvdGltc3RhbXAudHMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUtY29yZWpzMi9jb3JlLWpzL2pzb24vc3RyaW5naWZ5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lLWNvcmVqczIvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lLWNvcmVqczIvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL2pzb24vc3RyaW5naWZ5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvcmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2N0eC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZGVzY3JpcHRvcnMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2RvbS1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2V4cG9ydC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZmFpbHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2dsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faGFzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19oaWRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXMtb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZHAuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3Byb3BlcnR5LWRlc2MuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmRlZmluZS1wcm9wZXJ0eS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0lDQUE7O0FBQ0EsSUFBQSxXQUFBLEdBQUEsT0FBQSxDQUFBLGlCQUFBLENBQUE7O0FBQ0EsSUFBQSxNQUFBLEdBQUEsT0FBQSxDQUFBLFlBQUEsQ0FBQSxDLENBQ0E7OztBQUNBLElBQUEsaUJBQUEsR0FBQSxPQUFBLENBQUEsdUJBQUEsQ0FBQTs7QUFDQSxHQUFHLENBQUMsT0FBSixHQUFjO0FBQ1osRUFBQSxRQUFRLEVBQUU7QUFBQSxXQUFNLFdBQUEsQ0FBQSxlQUFBLEVBQU47QUFBQSxHQURFO0FBRVosRUFBQSxTQUFTLEVBQUUsbUJBQUMsVUFBRDtBQUFBLFdBQWdCLFdBQUEsQ0FBQSxnQkFBQSxDQUFpQixVQUFqQixDQUFoQjtBQUFBLEdBRkM7QUFHWixFQUFBLFNBQVMsRUFBRTtBQUFB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiJ9
