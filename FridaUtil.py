#!/usr/bin/python3
from error import DeviceNotFoundError
import frida, asyncio, logging


def isUSB(device):
    return device and device.type

def getDeviceList()->list:
    return frida.get_device_manager().enumerate_devices()

def getAppList(device: frida.core.Device)->list:
    return device.enumerate_applications()
    
def getDevice(id) -> frida.core.Device:
    device_list: list = frida.get_device_manager().enumerate_devices()
    device: frida.core.Device = [
        device for device in device_list if device.id == id]
    if device:
        return device[0]
    raise DeviceNotFoundError(id)


def getApp(device: frida.core.Device, application: str):
    app_list: list = device.enumerate_applications()
    app = [
        app for app in app_list if app.identifier == application][0]
    if app:
        return app
    raise DeviceNotFoundError()


def spawn(device: frida.core.Device, app: str)->frida.core.Session:
    pid = device.spawn([app.identifier])
    session: frida.core.Session = device.attach(pid)
    # device.resume(pid)
    return session
