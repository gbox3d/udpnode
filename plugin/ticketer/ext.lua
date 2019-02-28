print('load extention')
--dofile("")
gpio.mode(7,gpio.OUTPUT)
gpio.write(7,1)

function ext_main(delay)
    print("extention main start")
    stopUdpCast();
    gpio.write(7,0)
    
    extraRecvCb = function (packet)
        --print(c)
        if packet.MENU_CD ~= nil then
            print(packet.MENU_CD)
            gpio.serout(7,gpio.HIGH,{250000,250000},1)
        end
    end

end
