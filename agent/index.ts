// Module.ensureInitialized('Foundation')
import {get_app_classes, get_arguments, get_class_method, get_module, get_return_type, is_method_exists} from './ios/classdump'
import {hook, hook_specific_method_of_class, swizzle} from './ios/hook'
//import {app_transport_security, protected_resources_permissions, show_url_scheme, classes_potential_jailbreak_detection, methods_potential_jailbreak_detection} from './ios/static_analysis'
import {show_url_scheme} from './ios/static_analysis'
rpc.exports = {
  getClass: () => get_app_classes(),
  getMethod: (class_name) => get_class_method(class_name),
  getModule: () => get_module(),
  isMethodExists: (class_name, method_name) =>
      is_method_exists(class_name, method_name),
  getArguments: (class_name, method_name) =>
      get_arguments(class_name, method_name),
  getReturnType: (class_name, method_name) =>
      get_return_type(class_name, method_name),
  hookMethod: (class_name, method_name, signature) =>
      hook_specific_method_of_class(class_name, method_name, signature),
  hook: (library, func, signature) => hook(library, func, signature),
  swizzle: (class_name, method_name) => swizzle(class_name, method_name, false),
  staticAnalysis: () => {
 //   app_transport_security();
  //  protected_resources_permissions();
    show_url_scheme();
   // classes_potential_jailbreak_detection();
   // methods_potential_jailbreak_detection();
  }
};