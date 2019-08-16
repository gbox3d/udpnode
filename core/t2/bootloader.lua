majorVer, minorVer, devVer, chipid, flashid, flashsize, flashmode, flashspeed = node.info()
app_version = "T2:0.0.1"
app_config = {}
master_socket = nil
udp_safe_sender=nil
extraRecvCb =nil --추가적인 패킷 처리기 
boot_step = 'try'

local M={}

local function appStart()
    
    master_socket = net.createUDPSocket()

    udp_safe_sender =
        util8266.AsyncSender_Safe_udp(
        {
            getsocket = function()
                return master_socket
            end
        }
    )
    
    _G.packet_dic = {
        default = function(packet, _port, _ip)
            local rt = {result = "nocmd"}
            -- master_socket:send(sjson.encode(rt))
            udp_safe_sender(sjson.encode(rt),_port,_ip)
        end,
        eval = function(packet, _port, _ip)
            local _f = loadstring(packet.code)
            if (_f) then
                _f()
            else
                print("script err " .. packet.code)
            end
        end
    }

    function processRecv(s, c, _port, _ip)
        last_nt_tick = tmr.now()
        if c:byte(1, 1) == 123 then -- check '{}'
            local packet = sjson.decode(c)
            if packet.cmd ~= nil then
                if packet_dic[packet.cmd] ~= nil then
                    packet_dic[packet.cmd](packet, _port, _ip)
                else
                    print("unknown packet")
                end
            else
                if extraRecvCb ~= nil then
                    extraRecvCb(packet, _port, _ip)
                end
            end
        end
    end

    master_socket:on("receive", processRecv)

    print('listen udp port : ' .. app_config.data_port)
    master_socket:listen(app_config.data_port)

    
    --확장기능 실행 
    
    if ext_main then 
        print('call ext_main')
        if app_config.devmode == true then 
            print('its dev time...')
            tmr.create():alarm(5000,tmr.ALARM_SINGLE,
            function()
                ext_main(100)
            end)
        else 
            ext_main(100)
        end
    else
        print('no plugin')
    end
    
    print('boot success')
    
end

function M.boot()

    print("App version " .. app_version .. " start..")

    if file.exists("config.json") then
        file.open("config.json", "r")
        local config_file = file.read()
        file.close()
        app_config = sjson.decode(config_file)
    else
        print("find config.lua")
        dofile("config.lua")
        file.open("config.json", "w")
        file.write(sjson.encode(app_config))
        file.close()
    end

    wifi.setphymode(wifi.PHYMODE_G)
    wifi.sleeptype(wifi.NONE_SLEEP)

    -- wifi mode setup
    if app_config.apmode then
        util8266.setupAP(function ()
            appStart()
            boot_step = "AP-READY"
        end)
    else
        local _apOn = false
        util8266.setupSTA(
            app_config,
            function(evt)
                if evt == wifi.eventmon.STA_GOT_IP then
                    print("STATION_GOT_IP")
                    print(wifi.sta.getip())
                    local strip = wifi.sta.getip()
                    --print(strip)
                    if app_config.dhcp then
                        print("dhcp mode")
                        app_config.ip = {string.match(strip, "(%d+).(%d+).(%d+).(%d+)")}
                    else
                        print("static ip mode")
                    end
                    boot_step = "STA-READY"
                    appStart()
                end
            end
        )
    end



end

--------------------------------------------------

return M
