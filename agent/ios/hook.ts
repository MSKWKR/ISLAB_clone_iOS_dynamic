import {get_timestamp} from '../utils/timstamp'
import {readable} from './argparser'
export function swizzle(class_name, sel, trace_result) {
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
                const obj = new ObjC.Object(args[i]).toString()
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
        let res = {
          'time': get_timestamp(),
          'lib': class_name,
          'func': sel,
          'args': readableArgs
        };
        console.log(
            `[${res['time']}] [${class_name}] [${sel}] [${readableArgs}]`)
        send(JSON.stringify(res))
        // send(`[${get_timestamp()}] [${class_name}] [${sel}]
        // [${readableArgs}]`) console.log('Backtrace:\n\t' + backtrace);
      },
      onLeave
    });
  } catch (err) {
    console.log(`[${get_timestamp()}] Error while hook ${class_name} ${
        sel} with message ${err}`)
  }
}
export function hook_specific_method_of_class(className, funcName, signature) {
  var hook = ObjC.classes[className][funcName];
  try {
    if (hook === undefined) return;
    Interceptor.attach(hook.implementation, {
      onEnter: function(args) {
        const pretty = [];
        for (var i = 0; i < signature.args.length; i++) {
          const arg = args[i];
          pretty[i] = readable(signature.args[i], arg);
        }  // userDidTakeScreenshotNotification
        const backtrace = Thread.backtrace(this.context, Backtracer.ACCURATE)
                              .map(DebugSymbol.fromAddress)
                              .join('\n\t')
                              .toString();
        let res = {
          'time': get_timestamp(),
          'lib': className,
          'func': funcName,
          'args': pretty
        };
        console.log(`[${res['time']}] [${res['lib']}] [${res['func']}] [${
            res['args']}]`)
        send(JSON.stringify(res))
        // console.log('Backtrace:\n\t' + backtrace);
      }
    });
  } catch (err) {
    console.log(`[${get_timestamp()}] Error while hook ${className} ${
        funcName} with message ${err}`)
  }
}

export function hook(library, func, signature) {
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
        let res = {
          'time': get_timestamp(),
          'lib': library,
          'func': func,
          'args': pretty
        };
        console.log(`[${res['time']}] [${res['lib']}] [${res['func']}] [${
            res['args']}]`);
        send(JSON.stringify(res))
        // send(`[${get_timestamp()}] [${library}] [${func}] [${pretty}]`);
        // console.log(backtrace.replace(/,/g, '\n'));
      }
    });
  } catch (err) {
    console.log(`[${get_timestamp()}] Error while hook ${library} ${
        func} with message ${err}`)
  }
}