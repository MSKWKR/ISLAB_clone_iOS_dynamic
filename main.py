#!/usr/bin/python3
from error import DeviceNotFoundError
import frida
import sys
import logging
import FridaUtil
import json, rule_parse,logging
import log_parser
import report_sys
# import parse_log
from datetime import datetime

#尋找裝置

class Device:
    #初始化
    def __init__(self, identifier):
        
        try:
            self.device: frida.core.Device = FridaUtil.getDevice(identifier)
        except DeviceNotFoundError as e:
            print(e.message)
            sys.exit(0)
    #連接裝置，
    def attach(self, app, script: str):
        self.app: _frida.Application = FridaUtil.getApp(self.device, app)
        front = self.device.get_frontmost_application()
        if self.app and self.app.pid:
            if front and front.pid == self.app.pid:
                self.session = self.device.attach(self.app.name)
                self.session.disable_child_gating()
            else:
                self.device.kill(self.app.pid)
                self.session = FridaUtil.spawn(self.device, self.app)
        else:
            self.session = FridaUtil.spawn(self.device, self.app)
        self.script: frida.core.Script = self.session.create_script(script)
        self.script.on('message', lambda msg, data: logging.info(msg['payload']))
        self.script.load()
        # self.session.enable_jit()
        # self.device.resume(self.app.pid)

    def load(self):
        # script: frida.core.Script = self.session.create_script(script)
        # # script.on('message', on_message)
        # script.load()
        objc_rules:list = rule_parse.get_objc_rules()
        swift_rules:list = rule_parse.get_swift_rules()
        func:ScriptExports = self.script.exports
        if swift_rules:
            for rule in swift_rules:
                param:dict = {'args': [], 'ret': []}
                if 'args' in rule:
                    param['args'] = rule['args']
                if 'ret' in rule:
                    param['ret'] = rule['ret']
                func.hook(rule['module_name'], rule['method'], param)
                
        if objc_rules:
            for rule in objc_rules:
                if not func.is_method_exists(rule['class_name'], rule['method']):
                    continue
                param:dict = {'args': [], 'ret': []}
                if 'args' in rule:
                    param['args'] = rule['args']
                else:
                    param['args'] = func.get_arguments(rule['class_name'], rule['method']);
                if 'ret' in rule:
                    param['ret'] = rule['ret']
                func.swizzle(rule['class_name'], rule['method'], param)
        func.hook_method('NSNotificationCenter', '- addObserver:selector:name:object:', {'args': func.get_arguments('NSNotificationCenter', '- addObserver:selector:name:object:')});
        

    def staticAnalysis(self):
        func = self.script.exports
        func.static_analysis()


    def findModule(self, target:str)->str:
        func:ScriptExports = self.script.exports
        module = func.get_module()
        for module_name in module:
            if module_name == target:
                return target
        print(f'Module {target} not found.')
        return None

    def findModuleMethods(self, module:str):
        func:ScriptExports = self.script.exports
        for method in func.get_method(module):
            print(method)

    def findMethodInModule(self, module:str, target:str)->str:
        func:ScriptExports = self.script.exports
        methods = func.get_module_class(module)
        for method in methods:
            if methods == target:
                return target
        print(f'Method {target} not found in module {module}.')

    def enumeModule(self):
        func:ScriptExports = self.script.exports
        for module in func.get_module():
            print(module)
    def enumeClass(self):
        func:ScriptExports = self.script.exports
        for module in func.get_class():
            print(module)
    # def getClassMethods(self, class_name):
    #     func:ScriptExports = self.script.exports;
    #     for module in func.get_method():
    #         print(module)



def on_message(message: dict, data: str):
    if message['type'] == 'send':
        print(f"[*] {message['payload']}")
    else:
        print(message)

def get_device_list()->list:
    return FridaUtil.getDeviceList()

def get_app_list(device:frida.core.Device)->list:
    return FridaUtil.getAppList(device)

if __name__ == '__main__':
    # Get device list #
    while(True):
        device_list:list = get_device_list()
        index:int = 0
        for device in device_list:
            print(f'{index} {device.type}\r\t {device.name}\r\t\t\t {device.id}')
            index += 1
        select:str = input('>')
        if (select.isnumeric()) and (len(device_list) > int(select)):
            break
    select_device: frida.core.Device = device_list[int(select)]

    # Get Application list #
    while(True):
        application_list:list = get_app_list(select_device)
        index:int = 0
        for app in application_list:
            print(f'{index:3d} {app.name}\r\t\t\t {app.identifier}')
            index += 1
        select:str = input('>')
        if (select.isnumeric()) and (len(application_list) > int(select)):
            break
    select_app = application_list[int(select)]
    # create log file
    now = datetime.now()
    current_time = now.strftime("%H-%M-%S")
    logging.basicConfig(level=logging.INFO, format='%(message)s', filename=f'./output/{select_app.identifier}.log', filemode='a')
    device: Device = Device(select_device.id)
    # search for app store information
    with open('_agent.js', 'r') as f:
        script_content = f.read()
    device.attach(select_app.identifier, script_content)
    # device.staticAnalysis()
    # device.enumeClass()
    # device.findModuleMethods('TaiwanPay_iPhone.FirstLaunch')
    
    device.load()
    device.staticAnalysis()
    c = input()
    # parse_log.parse_log(select_app.identifier)
    print("Starting to log parsing")
    log_parser.parse_log(select_app.identifier)
    print('exiting ios-dynamic-analysis-framework\n')
    print('Entering report generating system')
    report_sys.results(select_app.identifier)

    
    sys.exit(0)