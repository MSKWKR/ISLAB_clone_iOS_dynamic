export function get_app_classes() {
  let free = new NativeFunction(
      Module.findExportByName(null, 'free'), 'void', ['pointer']);
  let copyClassNamesForImage = new NativeFunction(
      Module.findExportByName(null, 'objc_copyClassNamesForImage'), 'pointer',
      ['pointer', 'pointer']);
  let p = Memory.alloc(Process.pointerSize);
  p.writeInt(0);
  let path = ObjC.classes.NSBundle.mainBundle().executablePath().UTF8String();
  let pPath = Memory.allocUtf8String(path);
  let pClasses = copyClassNamesForImage(pPath, p);
  let count = p.readUInt();
  let classesArray = new Array(count);
  for (let i = 0; i < count; i++) {
    let pClassName =
        ptr(pClasses.toString()).add(i * Process.pointerSize).readPointer();
    classesArray[i] = pClassName.readUtf8String();
  }
  free(pClasses);
  return classesArray;
}

export function get_class_method(class_name) {
  let methods = ObjC.classes[class_name].$ownMethods;
  send(ObjC.classes[class_name])
  for (let j = 0; j < methods.length; j++) {
    send(methods[j])
  }
  return methods;
}

export function is_method_exists(class_name, method_name) {
  try {
    ObjC.classes[class_name][method_name].$ownMethods;
    return true;
  } catch (error) {
    console.log(`[${class_name}] [${method_name}] doesn't exists`);
    return false;
  }
}

export function get_arguments(class_name, method_name) {
  return ObjC.classes[class_name][method_name].argumentTypes;
}

export function get_return_type(class_name, method_name) {
  return ObjC.classes[class_name][method_name].returnType;
}
export function get_module() {
  let list = Process.enumerateModules();
  for (let i = 0; i < list.length; i++) {
    send(list[i].enumerateExports())
  }
  return Process.enumerateModules();
}
export function get_module_by_name(module_name) {
  return Process.getModuleByName(module_name).enumerateSymbols()
}
