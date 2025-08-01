#
class DeviceNotFoundError(Exception):
    def __init__(self, id):
        super().__init__()
        self.message = f'Device {id} not found'
