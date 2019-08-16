M = {}
function M.AsyncSender_Safe_udp(option)
    local test_set = false
    local tempBuf = ""
    local _timer = tmr.create()
    return function(data, _port, _ip)
        local socket = option.getsocket()
        function _send(data)
            --print("buf : " .. data)
            if test_set == true then
                tempBuf = tempBuf .. data --print(tempBuf)
            else
                local _data = tempBuf .. data
                tempBuf = ""
                if _data:len() > 0 then
                    test_set = true
                    --print("send :  " .._data)
                    socket:send(
                        _port,
                        _ip,
                        _data,
                        function()
                            --need cool time ?
                            --print("sent" .._data)
                            _timer:alarm(
                                1,
                                tmr.ALARM_SINGLE,
                                function()
                                    test_set = false
                                    if tempBuf:len() > 0 then
                                        _send("")
                                    end
                                end
                            )
                        end
                    )
                end
            end
        end
        if socket ~= nil then
            _send(data)
        end
    end --function
end

function M.setupAP(callback)
    wifi.sta.autoconnect(0)
    wifi.sta.disconnect()

    wifi.setmode(wifi.SOFTAP)

    --패스워드를 8자이상입력하지않으면 ssid 가 ESP8266_XXX이런식으로 설정됨
    --wifi.ap.config({ssid="esptest",pwd="123456789"})
    -- nil 을 주면 패스워드 설정안해도됨
    wifi.ap.config({ssid = "BNESP" .. chipid, pwd = nil})
    wifi.ap.setip({ip = "192.168.0.1", netmask = "255.255.255.0", gateway = "192.168.0.1"})
    print("start ap mode")

    callback();
end

function M.setupSTA(_config,callback)
    wifi.setmode(wifi.STATION)
    wifi.sta.autoconnect(1)
    wifi.sta.disconnect()

    wifi.eventmon.register(
        wifi.eventmon.STA_CONNECTED,
        function(T)
            print(
                "\n\tSTA - CONNECTED" ..
                    "\n\tSSID: " .. T.SSID .. "\n\tBSSID: " .. T.BSSID .. "\n\tChannel: " .. T.channel
            )
            callback(wifi.eventmon.STA_CONNECTED)
        end
    )

    wifi.eventmon.register(
        wifi.eventmon.STA_DISCONNECTED,
        function(T)
            print(
                "\n\tSTA - DISCONNECTED" ..
                    "\n\tSSID: " .. T.SSID .. "\n\tBSSID: " .. T.BSSID .. "\n\treason: " .. T.reason
            )
            callback(wifi.eventmon.STA_DISCONNECTED)
        end
    )

    wifi.eventmon.register(
        wifi.eventmon.STA_GOT_IP,
        function(T)
            print(
                "\n\tSTA - GOT IP" ..
                    "\n\tStation IP: " ..
                        T.IP .. "\n\tSubnet mask: " .. T.netmask .. "\n\tGateway IP: " .. T.gateway
            )
            callback(wifi.eventmon.STA_GOT_IP)
        end
    )

    station_cfg = {}
    station_cfg.ssid = app_config.ssid
    station_cfg.pwd = app_config.passwd
    station_cfg.save = true
    wifi.sta.config(station_cfg)

    -- wifi.sta.config(app_config.ssid,app_config.passwd,1)

    if _config.dhcp then
    else
        wifi.sta.setip(
            {
                ip = _config.ip[1] ..
                    "." .. _config.ip[2] .. "." .. _config.ip[3] .. "." .. _config.ip[4],
                netmask = "255.255.255.0",
                gateway = _config.ip[1] .. "." .. _config.ip[2] .. "." .. _config.ip[3] .. ".1"
            }
        )
    end
    wifi.sta.connect()
end

return M
