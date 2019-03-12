new Vue({
    el: '#app',

    data: {
        resp:[],
        totalPercent: 0,
        totalSafeDays: 0
    },

    mounted: function(){
        
        var id = window.location.search.slice(3);
        var origin = window.location.origin;
        
        var self = this;
        fetch(`${origin}/scraper?${id}`)
            .then((resp) => {
                return resp.json();
            })
            .then((json) => {
                var len = json.subjects.length
                
                for(var i=0; i<len; i++){

                    var x = new Object;
                    x.name = json.subjects[i];

                    var percent = 0;
                    if(json.attendanceOutOf[i] != 0){
                        percent = json.attendance[i]/json.attendanceOutOf[i];
                    }
                    x.percent = Math.round(percent*100);
                    
                    x.safeDays = 0;
                    if(percent > 0.8){
                        x.safeDays = Math.floor(json.attendance[i] / 0.8) - json.attendanceOutOf[i];
                    }

                    self.resp.push(x);
                }

                var totalA=0;
                var totalO=0;

                for(var i=0; i<6; i++){
                    totalA += json.attendance[i];
                    totalO += json.attendanceOutOf[i];
                }
                self.totalPercent = Math.round((totalA/totalO)*100);

                var totalSafe = 0;
                if(totalA/totalO > 0.75){
                    totalSafe = Math.floor(totalA / 0.75) - totalO;
                }
                self.totalSafeDays = totalSafe
                
            })
    }
});