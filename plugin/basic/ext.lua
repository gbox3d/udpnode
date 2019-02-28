print('load plugin')
--dofile("")
gpio.mode(0,gpio.OUTPUT) -- onoff 만 가능 
gpio.write(0,0)

gpio.mode(3,gpio.OUTPUT) --pwm , onoff 가능
gpio.write(3,0)

gpio.mode(4,gpio.OUTPUT) --상태표시용 ,내장 led 
gpio.write(4,0)


local _loop = function ()
    gpio.write(3,1) gpio.write(4,0) tmr.create():alarm(500,tmr.ALARM_SINGLE,function() gpio.write(4,1) gpio.write(3,0) end)
    
end

local __doit = function()
    
    tmr.create():alarm(3000,tmr.ALARM_AUTO,_loop)

    gpio.write(4,1)
    gpio.write(3,1)

end

function ext_main(delay)
    print("extention main start")

    tmr.create():alarm(delay,tmr.ALARM_SINGLE,
        function()
            local __ps = boot_status.process;
            boot_status.process = 'stub_check'
            save_BootStatus();
            __doit();
            boot_status.process = __ps
            save_BootStatus();

        end)
end
