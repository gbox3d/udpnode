
local M={}

local timerid_Udpcaster = tmr.create()

M.start = function(app_config)

    print("cast delay :" .. app_config.cast_delay)

    local ip = app_config.ip
    local broad_ip = ip[1] .. "." .. ip[2] .. "." .. ip[3] .. ".255"
    
    timerid_Udpcaster:alarm(
        app_config.cast_delay,
        tmr.ALARM_AUTO,
        function()
            master_socket:send(
                    app_config.bc_port,
                    broad_ip,
                    sjson.encode({sk = 1, did = 0, cid = chipid, type = "bc"})
                )
        end
    )
end

M.stop = function()
    timerid_Udpcaster:stop()
end

return M