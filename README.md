# Web_Develop_Week10

Web_Develop_Week10

비동기 함수 displayCarbonUsage

const displayCarbonUsage = async (apiKey, region) => {
};
-> this를 호출 시, 전역 변수로 여겨짐(사용 불가)
-> 짧은 코드에서 유용

async function displayCarbonUsage(apiKey, region) {
}
-> this를 호출 시, 해당 객체가 선택됨
-> 긴 코드에서 유용

params과 headers

params: {
countryCode: region,
},
headers: {
//please get your own token from CO2Signal https://www.co2signal.com/
"auth-token": apiKey,
},

보안의 문제로 URL에 들어가지 않도록 하기 위해선 headers안에 포함하여 전송해야한다.

LUQIt516qH6bi
