import frida
import time

def on_message(message, data):
    if message['type'] == 'send':
        print('[*] {0}'.format(message['payload']))
    else:
        print(message)

device = frida.get_usb_device()
pid = device.spawn(["com.highaltitudehacks.DVIAswiftv2.BDKYBV5AH6"])
session = device.attach(pid)
script = session.create_script("""
"use strict";
ObjC.import('UIKit');

const app = Application.wrap(NSWorkspace.sharedWorkspace().frontmostApplication().NSRunningApplication);
const window = app.windows().firstObject();
const vc = window.contentViewController();
const className = ObjC.class_getName(vc.class());
const methodName = 'description';
const sel = ObjC.selector(methodName);
const imp = ObjC['implementation']([className, methodName], 'void');
const method = new NativeFunction(imp, 'void', ['pointer', 'pointer']);

rpc.exports = {
    getCurrentPage: function () {
        const result = Memory.allocUtf8String('None');
        method(vc, sel, result);
        return Memory.readUtf8String(result);
    }
};
""")
script.on('message', on_message)
script.load()
device.resume(pid)

while True:
    print(script.exports.getCurrentPage())
    time.sleep(1)
