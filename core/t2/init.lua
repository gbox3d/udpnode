util8266 = require("util8266")
bootloader = require("bootloader")

if file.exists("ext.lua") then dofile('ext.lua') end

bootloader.boot()

-- if app_config.devmode then

--     print("it's dev time")
--     tmr.create():alram(5000,tmr.ALRAM_SINGLE,bootloader.boot)

-- else 
--     bootloader.boot()

-- end