updnode
===
### 기본 기능
updnode 는 nodemcu 가지고 만든 network bootloader 입니다.  
최소한의 기본 기능만을 제공하고 나머지는 동적으로 확장 가능 하도록 했습니다.

1999번 포트로 기본 정보(ip주소)를 브로드 캐스팅을 합니다.  
동시에 같은 포트로 데이터를 송수신합니다.

### 설정 파일
config.lua 에는 기본 설정 정보가 들어가며 수정할 수 없습니다.  
대신에, config.json에 현재설정 정보를 저장합니다. 그리고 이것은 수정가능합니다.
초기에 업로드하는 파일은 .lua만 해줘도 무방합니다. 
설정프로그램을 사용하여 설정값들을 재수정하기 위해서 json파일이 필요하기 때문입니다.

### 패킷 
기본으로 제공되는 패킷은 "eval" 입니다.

형식은 다음과 같습니다.

{cmd:"eval",code:" 루아코드 스트링 "}

"eval" 은 원격으로 루아 코드를 실행시켜줍니다.  
 이것으로 많은 확장을 할 수 있습니다.
 
새로운 패킷에 대한 처리는 packet_dic 에 함수를 추가하여 처리합니다.

```lua
packet_dic["new packet name"] = function(packet) .. 처리내용 ..  end 
```

### 부트상태 값 
boot_status는 status.json에 저장됩니다.  
boot_status.process 는 부트 초기에는 "startup" 입니다.  
성공적으로 부트가 완료되면 APOK,STOK 둘중 하나가 되고 status.json에 저장합니다.  
boot_status.mode 는 "normal" 이 됩니다.

현재의 부트상태를 저장하고 싶다면 다음과 같이 합니다.

```lua
boot_status.process = "현재상태"
saveStatus()
```

잘못된 코드가 반복적으로 호출되지 않도록 하기 위하여 boot_status.process값에 따라서 부팅과정을 조절합니다.  
루아펌로딩후 boot_status.process 가 "startup" 상태이면 부팅을 멈추고 nook로 상태를 바꾸어 저장합니다.  
check_stub( boot_status.mode 는 check) 이면 ext_main 함수(ext.lua) 콜을 유보합니다.(네트웍 기능은 정상작동)  

STOK,APOK 이면 정상 동작을 수행합니다.

실행모드를 확인하기 위해서는 boot_status.mode 값을  확인합니다.  
정상동작 상태(normal)인지 체크부트(check) 상태인지 알아보기 위해서는 다음과 같은 코드로 확인합니다.

```lua
rt ={type="rs",id=0,run_mode=boot_status.mode} 
udp_safe_sender(cjson.encode(rt),2012,"192.168.10.107") 
```

ext.lua 는 확장을 위한 루아 파일입니다.  
지속적으로 추가를 원하는 기능은 여기에 코드를 써줍니다

### 유용한 전역변수

last_nt_tick : 마지막 네트웍 응답시간을 얻는다.

rt : 리턴값만들기용 전역 변수

네트웍응답 지연시간을 다음과 같이 얻을수있다.
```lua
tmr.now()-last_nt_tick
```

### 루아 오브잭트 파일 처리

json을 이용해서 텍스트로 전환한뒤에 저장한다.  

저장 
```lua
local data = {a=1,msg='ok'} -- json으로 저장하고싶은 오브잭트
file.open("data.json", 'w') 
file.write(sjson.encode( data )) 
file.close() 
```
읽기
```lua
file.open("data.json", 'r') 
local data = sjson.decode(file.read())
file.close()

```

### 패킷 샘플 

0번 gpio 끄기
```js
{
cmd :"eval",
code : "gpio.mode(0,1)gpio.write(0,0)"
}
```
0번 gpio 켜기
```js
{
cmd :"eval",
code : "gpio.mode(0,1)gpio.write(0,1)"
}
```
브로드 캐스팅 끄기
```js
{
cmd : "eval",
code : "stopUdpCast()"
}
```
브로드 캐스팅 켜기
```js
{
cmd : "eval",
code : "startUdpCast()"
}
```
echo 패킷추가
```js
{
cmd:"eval",
code : "packet_dic[\"echo\"] = function(packet) local rt = {type=\"rs\",result=\"echo\",msg=packet.msg} udp_server:send(cjson.encode(rt))  end"
}

```
