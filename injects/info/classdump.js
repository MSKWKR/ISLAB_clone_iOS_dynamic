
function get_app_classes() {
  var free = new NativeFunction(
      Module.findExportByName(null, 'free'), 'void', ['pointer']);
  var copyClassNamesForImage = new NativeFunction(
      Module.findExportByName(null, 'objc_copyClassNamesForImage'), 'pointer',
      ['pointer', 'pointer']);
  var p = Memory.alloc(Process.pointerSize);
  Memory.writeUInt(p, 0);
  var path = ObjC.classes.NSBundle.mainBundle().executablePath().UTF8String();
  var pPath = Memory.allocUtf8String(path);
  var pClasses = copyClassNamesForImage(pPath, p);
  var count = Memory.readUInt(p);
  var classesArray = new Array(count);
  for (var i = 0; i < count; i++) {
    var pClassName = Memory.readPointer(pClasses.add(i * Process.pointerSize));
    classesArray[i] = Memory.readUtf8String(pClassName);
  }
  free(pClasses);
  return classesArray;
}

function get_class_method(class_name) {
  var methods = ObjC.classes[class_name].$ownMethods;
  return methods;
}

function get_arguments(class_name, method_name) {
  return ObjC.classes[class_name][method_name].argumentTypes;
}

function get_return_type(class_name, method_name) {
  return ObjC.classes[class_name][method_name].returnType;
}
function get_module() {
  var arr = [];
  Process.enumerateModules({
    onMatch: function(module) {
      arr.push(module.name);
    },
    onComplete: function() {}
  });
  return arr;
}

function get_timestamp() {
  var today = new Date();
  var timestamp = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' +
      today.getDate() + ' ' + today.getHours() + ':' + today.getMinutes() +
      ':' + today.getSeconds() + ':' + today.getMilliseconds();
  return timestamp;
}

function swizzle(class_name, sel, trace_result) {
  var hook = ObjC.classes[class_name][sel];
  try {
    var onLeave
    if (trace_result) {
      onLeave = function(retVal) {
        var ret = retVal
        try {
          ret = new ObjC.Object(ret).toString()
          console.log(ret);
        } catch (ignored) {
          //
        }
      }
    }
    Interceptor.attach(hook.implementation, {
      onEnter: function(args) {
        const readableArgs = [];
        try {
          for (var i = 2; i < hook.argumentTypes.length; i++) {
            if (hook.argumentTypes[i] === 'pointer') {
              try {
                const obj = ObjC.Object(args[i]).toString()
                readableArgs.push(obj)
              } catch (ex) {
                readableArgs.push(args[i])
              }
            } else {
              readableArgs.push(args[i])
            }
          }
        } catch (err) {
          console.log(err)
        }
        const backtrace = Thread.backtrace(this.context, Backtracer.ACCURATE)
                              .map(DebugSymbol.fromAddress)
                              .join('\n\t')
                              .toString();
        console.log(
            '[' + get_timestamp() + '] [' + class_name + '] [' + sel + '] [' +
            readableArgs + ']');
        // console.log('Backtrace:\n\t' + backtrace);
      },
      onLeave
    });
    console.log('hooked ' + class_name + ' ' + sel);
  } catch (err) {
    console.log('[' + get_timestamp() + '] Hooking Error: ' + err.message);
  }
}
function hook_specific_method_of_class(className, funcName, signature) {
  var hook = ObjC.classes[className][funcName];
  try {
    if (hook === undefined) return;
    Interceptor.attach(hook.implementation, {
      onEnter: function(args) {
        try {
          const pretty = [];
          for (var i = 0; i < signature.args.length; i++) {
            const arg = args[i];
            pretty[i] = readable(signature.args[i], arg);
          }


          // // console.log(
          //     new ObjC.Object(args[4]) + ' ' +
          //     (new ObjC.Object(args[4]).toString() ===
          //      'userDidTakeScreenshotNotification'));  //
          //      userDidTakeScreenshotNotification,
          //                                              // only for detect
          //                                              // screenshot
          const backtrace = Thread.backtrace(this.context, Backtracer.ACCURATE)
                                .map(DebugSymbol.fromAddress)
                                .join('\n\t')
                                .toString();
          console.log(
              '[' + get_timestamp() + '] [' + className + '] [' + funcName +
              '] [' + pretty + ']');
          // console.log('Backtrace:\n\t' + backtrace);
        } catch (err) {
          console.log(err)
        }
      }
    });
    console.log('hooked ' + className + ' ' + funcName);
  } catch (err) {
    console.log('[' + get_timestamp() + '] Hooking Error: ' + err.message);
  }
}
function readable(type, arg) {
  var res = ptr(arg);
  // console.log(type + ' ' + arg)
  switch (type) {
    case 'char *':
      try {
        res = Memory.readUtf8String(ptr(arg));
      } catch (err) {
        try {
          res = ObjC.Object(ptr(arg));
        } catch (ignore) {
          console.log(ignore)
        }
      }
      break;
    case 'Int32':
      res = arg.toInt32();
      break;
    case 'pointer':
      try {
        res = Memory.readUtf8String(ptr(arg));
      } catch (ignore) {
        try {
          res = ptr(arg).readPointer()
        } catch (ignore) {
          try {
            res = '\n' +
                hexdump(ptr(arg), {length: 64, header: true, ansi: true}) +
                '\n';
          } catch (ignore) {
            res = ptr(arg);
          }
        }
      }
      break;
  }
  return res;
}

function hook(library, func, signature) {
  const funcPtr = Module.findExportByName(library, func);
  if (!funcPtr) {
    console.log('symbol not found');
    return;
  }
  try {
    Interceptor.attach(funcPtr, {
      onEnter(args) {
        const pretty = [];
        for (var i = 0; i < signature.args.length; i++) {
          const arg = args[i];
          pretty[i] = readable(signature.args[i], arg);
        }

        const backtrace = Thread.backtrace(this.context, Backtracer.ACCURATE)
                              .map(DebugSymbol.fromAddress)
                              .toString();
        console.log(
            '[' + get_timestamp() + '] [' + library + '] [' + func + '] [' +
            pretty + ']');
        // console.log(backtrace.replace(/,/g, '\n'));
      }
    });
  } catch (err) {
    console.log('[' + get_timestamp() + '] Hooking Error: ' + err.message);
  }
  console.log('hooked ' + library + ' ' + func);
}

rpc.exports = {
  getClass: function() {
    return get_app_classes();
  },
  getMethod: function(class_name) {
    return get_class_method(class_name);
  },
  getModule: function() {
    return get_module();
  },
  getArguments: function(class_name, method_name) {
    return get_arguments(class_name, method_name);
  },
  getReturnType: function(class_name, method_name) {
    return get_return_type(class_name, method_name);
  },
  hookMethod: function(class_name, method_name, signature) {
    hook_specific_method_of_class(class_name, method_name, signature);
  },
  hook: function(library, func, signature) {
    hook(library, func, signature);
  },
  swizzle: function(class_name, method_name) {
    swizzle(class_name, method_name, false);
  }
};