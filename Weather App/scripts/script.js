'use strict';

const key = 'dda175c03f9d60359987d65376ea067f';
const aqi = document.querySelector('.aqi');
let latitude, longitude;
const date = new Date();
const news = document.querySelector('.news');

if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
        function(position){            
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;


            ////////////////////////////

            setTimeout(() => {

                // leaflet library     
                var map = L.map('map1').setView([latitude, longitude], 13);
            
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
            
                // chart function
                charts(latitude, longitude);
            
                let temp = {
                    min: 0,
                    max: 0,
                    description: ''
                };
                
                // temperature api
                
                fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`).
                then(response => response.json()).
                then(el => {
                    if(el.main.feels_like >= el.main.temp_min){
                        temp.max = (el.main.feels_like - 273).toFixed(1);
                        temp.min = (el.main.temp_min - 273).toFixed(1);
                    }
                    else{
                        temp.max = (el.main.temp_min - 273).toFixed(1);
                        temp.min = (el.main.feels_like - 273).toFixed(1);
                    }
                    temp.description = el.weather[0].description;
                    temp.description = el.weather[0].description;
                    console.log(el);
                });
                
                setTimeout(() => L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup(L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                }))
                .setPopupContent(`Min: ${temp.min}&deg;C Max: ${temp.max}&deg;C Description: ${temp.description}`)
                .openPopup(), 300);
            
                ////////////////// stats ////////////////////
            
                fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}`).
                then(response => response.json()).
                then(el => {
                    console.log(el);
                    for(let i = 0; i < el.list.length; i++){
                        if(Number(el.list[i].dt_txt.slice(8,10)) === date.getDate()){
                            // console.log(el.list[i]);
                            let html = 
                            `<div class="cards">
                                <img src="./images/${el.list[i].weather[0].main}.svg" class="news--logo"/>
                                <div style="margin-left: 40px;">
                                    <h3 margin-left: 10px;">${el.list[i].dt_txt}</h3>
                                    <h3 margin-left: 10px;">${(el.list[i].main.temp_min - 273).toFixed(1)}&deg;C</h3>
                                    <h4>${el.list[i].weather[0].description}</h4>
                                </div>                    
                            </div>`;
                            news.insertAdjacentHTML('beforeend', html);
                        }
                        else break;
                    }   
                });
            
                //////////////////// when map is clicked ////////////////
            
                map.on('click', function(mapEvent){
                    let {lat, lng} = mapEvent.latlng;
            
                    let temp = {
                        min: 0,
                        max: 0,
                        description: '',
                        name: ''
                    };        
                    charts(lat, lng);
                    
                    // temperature api
            
                    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${key}`).
                    then(response => response.json()).
                    then(el => {
                        if(el.main.feels_like >= el.main.temp_min){
                            temp.max = (el.main.feels_like - 273).toFixed(1);
                            temp.min = (el.main.temp_min - 273).toFixed(1);
                        }
                        else{
                            temp.max = (el.main.temp_min - 273).toFixed(1);
                            temp.min = (el.main.feels_like - 273).toFixed(1);
                        }
                        temp.description = el.weather[0].description;
                        temp.name = el.name;
                    });
            
                    setTimeout(() => L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup(L.popup({
                        maxWidth: 250,
                        minWidth: 100,
                        autoClose: false,
                        closeOnClick: false,                    
                    }))
                    .setPopupContent(`Min: ${temp.min}&deg;C Max: ${temp.max}&deg;C Description: ${temp.description} Place: ${temp.name}`)
                    .openPopup(), 450);
                    
                    // deleting existing childNodes
            
                    while (news.firstChild) {
                        news.removeChild(news.firstChild);
                    }
            
                    // 5 days forecast api
            
                    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${key}`).
                    then(response => response.json()).
                    then(el => {
                        for(let i = 0; i < el.list.length; i++){
                            if(Number(el.list[i].dt_txt.slice(8,10)) === date.getDate()){
                                console.log(el.list[i]);
                                console.log(el.list[i].dt_txt);
                                let html = 
                                `<div class="cards">
                                    <img src="./images/${el.list[i].weather[0].main}.svg" class="news--logo"/>
                                    <div style="margin-left: 40px;">
                                        <h3>${el.list[i].dt_txt}</h3>
                                        <h3>${(el.list[i].main.temp_min - 273).toFixed(1)}&deg;C</h3>
                                        <h4>${el.list[i].weather[0].description}</h4>
                                    </div>
                                </div>`;
                                news.insertAdjacentHTML('beforeend', html);
                            }
                            else break;
                        }   
                    });
                });
            
                ////////////////// map click ends here //////////////////////
            
            }, 500);

            ///////////////////////////
        },
        function(){
            alert(`Can't do anything`);
        }
    )
}

////////// charts function ///////////
function charts(lat, lng){    
    let data = {
        min: [],
        max: [],
    };

    const graph = {
        least: [],
        most: [],
        dates: [],
    };
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

    let today;
    
    // 5 day forecast api

    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${key}`).
    then(response => response.json()).
    then(el => {
        console.log(el);
        today = Number(el.list[0].dt_txt.slice(8,10));
        console.log("Today = " + today);
        for(let i = 0; i < 6; i++){
            graph.dates.push(`${date.getDate() + i} ${months[date.getMonth()]}`);
        }
        for(let i = today; i < today + 6; i++){
            for(const j of el.list){
                if(i === Number(j.dt_txt.slice(8, 10))){
                    data.min.push(Number((j.main.temp_min - 273).toFixed(1)));
                    data.max.push(Number((j.main.temp_max - 273).toFixed(1)));
                }
            }      
            graph.least.push(Math.min(...data.min));
            graph.most.push(Math.max(...data.max));
            data.min = [];
            data.max = [];
        }
        // graph.dates = ["30 July", "31 July", "1 Aug", "2 Aug", "3 Aug"];
        // graph.least = [26.8, 26.4, 26.6, 26.8, 26.2];
        // graph.most = [32.2, 33.4, 31.9, 31.2, 32.5];
        console.log(graph);
    });

    setTimeout(() => {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    
    function drawChart() {
        const tempe = graph.least.map((el, index) => [el,graph.most[index]]);
        const latest = graph.dates.map((el, index) => [el, ...tempe[index]]);
        console.log(latest);
        latest.unshift(['Days', 'Minimum', 'Maximum'])
        var data = google.visualization.arrayToDataTable([
            ...latest
        ]);

        var options = {
        title: 'Temperature in Celsius',
        // curveType: 'function',
        legend: { position: 'bottom' },
        // colors: '#38cf41',
        };

        var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

        chart.draw(data, options);
    }
  }, 500);
}

/*

    // AQI api 

    // fetch('https://api.waqi.info/search/?token=d9d6fd38c2f43fc932d2c011f45d9b605748e0c6&keyword=bijnaur').
    // then(response => response.json()).
    // then(el => console.log(el))

*/