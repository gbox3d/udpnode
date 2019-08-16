udpcaster = require("udpcaster")

print('load plugin')
--dofile("")
gpio.mode(0,gpio.OUTPUT) -- onoff 만 가능 
gpio.write(0,0)

gpio.mode(3,gpio.OUTPUT) -- onoff 만 가능 
gpio.write(3,0)


gpio.mode(4,gpio.OUTPUT) --상태표시용 ,내장 led , 0 켜짐, 1 은 꺼짐
gpio.write(4,1)


function ext_main(delay)
    print("extention main start")

    gpio.write(4,0)
    udpcaster.start(app_config)
    
end
