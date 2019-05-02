print('load plugin')
--dofile("")
gpio.mode(0,gpio.OUTPUT) -- onoff 만 가능 
gpio.write(0,0)


gpio.mode(4,gpio.OUTPUT) --상태표시용 ,내장 led , 0 켜짐, 1 은 꺼짐
gpio.write(4,1)


local __doit = function()

    local _loop

    _loop = function()
        --루프코드
--        gpio.serout(4,gpio.HIGH,{250000,250000},2,function()
--            --컬백이 있어야 비동기 형식이된다.
--            tmr.create():alarm(1000,tmr.ALARM_SINGLE,_loop)
--        end)
    end

    _loop()

    gpio.write(4,0)

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
