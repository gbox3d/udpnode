print("load plugin")
--dofile("")
gpio.mode(0,gpio.OUTPUT) --상태표시용 
gpio.write(0,0)

gpio.mode(3,gpio.OUTPUT) --pwm , onoff 가능
gpio.write(3,0)

gpio.mode(4,gpio.OUTPUT) --상태표시용 ,내장 led 
gpio.write(4,0)


--i2c write 
function sendData(id,addr,data)
    i2c.start(id)
    i2c.address(id, addr, i2c.TRANSMITTER)
    i2c.write(id, data)
    i2c.stop(id)
end
-- i2c read
-- local data = readData(0,8,16)
function readData(id,addr,bytenum)
    i2c.start(id)
    i2c.address(id, addr, i2c.RECEIVER)
    local c = i2c.read(id, bytenum)
    i2c.stop(id)
    return c
end

local dataServer = {
    ip="x.x.x.x",
    port=2012,
    sendDelay = 5000
}

local __doit = function()
    --i2c master mode setup
    print("i2c setup...")
    local id, sda, scl = 0, 1, 2
    i2c.setup(id, sda, scl, i2c.SLOW)
    
    gpio.write(3,1) --red led off
    gpio.write(4,1) -- blue led off
    
    print("i2c setup ok")
end

function ext_main(delay)
    print("extention main start")
    
    tmr.create():alarm(
        delay,
        tmr.ALARM_SINGLE,
        function()
            local __ps = boot_status.process
            boot_status.process = "stub_check"
            save_BootStatus()
            __doit()
            boot_status.process = __ps
            save_BootStatus()

            print("stop udp broudcast")
            stopUdpCast();
        end
    )
end
