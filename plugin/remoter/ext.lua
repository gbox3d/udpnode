print("load plugin")
--dofile("")
gpio.mode(0,gpio.OUTPUT) -- onoff 만 가능 
gpio.write(0,0)

gpio.mode(3,gpio.OUTPUT) --pwm , onoff 가능
gpio.write(3,0)

gpio.mode(4,gpio.OUTPUT) --상태표시용 ,내장 led 
gpio.write(4,0)

-- local pulser = gpio.pulse.build( {
--     { [4] = gpio.LOW, delay=250000 },
--     { [4] = gpio.HIGH, delay=250000, loop=1, count=1, min=240000, max=260000 }
--   })
  


--i2c write 
function sendData(id,addr,data)
    i2c.start(id)
    i2c.address(id, addr, i2c.TRANSMITTER)
    i2c.write(id, data)
    i2c.stop(id)
end
-- i2c read
function readData(id,addr,bytenum)
    i2c.start(id)
    i2c.address(id, addr, i2c.RECEIVER)
    local c = i2c.read(id, bytenum)
    i2c.stop(id)
    return c
end

local __doit = function()
    
    tmrLooper:alarm(remoteServerConf.sendDelay,tmr.ALARM_AUTO,function ()

        --led 깜박임 
        gpio.write(4,0) tmr.create():alarm(500,tmr.ALARM_SINGLE,function() gpio.write(4,1) end)

        local _rt = {
            type="ping",
            _id=chipid
        }
        udp_safe_sender(sjson.encode(_rt),remoteServerConf.port,remoteServerConf.ip)
    end)

    gpio.write(4,1)
    
end

function ext_main(delay)
    print("extention main start")

    tmrObj1 = tmr.create();
    tmrLooper = tmr.create()

    remoteServerConf = {
        --ip="192.168.0.15",
        ip= app_config.remote_ip[1].."."..app_config.remote_ip[2].."."..app_config.remote_ip[3].."."..app_config.remote_ip[4],
        port= app_config.data_port,
        sendDelay = 5000
    }
    
    
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

            print("remote ip :" .. remoteServerConf.ip)
            print("heap size :" .. node.heap() )
            

        end
    )
end
