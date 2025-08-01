import { url } from "inspector";
import {get_timestamp} from '../utils/timstamp'

const {NSBundle} = ObjC.classes;

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
  let metadata = NSBundle.mainBundle().infoDictionary();
}

export function show_url_scheme() {
  var nsDictionary =
      ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_(
          'CFBundleURLTypes');
  if (nsDictionary == null) {
    //console.log('[*] URL scheme not defined by app')
    return;
  }
  //console.log(nsDictionary);
  nsDictionary = nsDictionary.objectAtIndex_(0);
  var dictKeys = nsDictionary.allKeys();
  var url_name;

  for (var i=0;i<dictKeys.count();i++){
    if(dictKeys.objectAtIndex_(i) == 'CFBundleURLName') {
        var key = dictKeys.objectAtIndex_(i);
        url_name = nsDictionary.objectForKey_(key);
    }
    else
        url_name = "";
  }
  for (var j = 0; j < dictKeys.count(); j++) {
    if (dictKeys.objectAtIndex_(j) == 'CFBundleURLSchemes') {
      var urlSchemesString = '';
      var nsArray = nsDictionary.objectForKey_('CFBundleURLSchemes');
      for (var k = 0; k < nsArray.count(); k++) {
        urlSchemesString = nsArray.objectAtIndex_(k);
        urlSchemesString += "://";
        urlSchemesString += url_name;
        let res = {
            'time': get_timestamp(),
            'lib': 'Infoplist',
            'func': 'CFBundleURLTypes',
            'args': urlSchemesString
        };
        console.log(`[${res['time']}] [${res['lib']}] [${res['func']}] [${res['args']}]`);
        send(JSON.stringify(res))
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