const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https")
const fs = require("fs");

var course = require('./course.json');

const app = express();

var status = "Normal";
// "Normal"  一般狀況
// "Success"  成功
// "Conflict"  衝堂
// "Duplicated"  重複選課
// "NotExist"  課程不存在
// "Full"  人數已滿
// "NotOpen"  這門課遴選不開放選修，所以無法選修。
// "ExceedCredit" 如果修這門課將會造成選課學分數超過上限(超修)，所以無法選修

app.get("/", function(req, res){
    res.sendFile(__dirname + "/views/B01.html");
})

app.get("/First/A01/A01", function(req, res){
    res.sendFile(__dirname + "/views/A03_" + status+ ".html");
    status = "Normal";
});

app.post("/AddAndSub/B01/ExtraJoin", function(req, res){
    const courseNo = req.query.CourseNo;
    const type = req.query.type;
    // TODO 等待時間
    const setTime = req.query.setTime;
    
    // 有這門課 且 選課清單沒有選
    if (course.courseData.find(i => i.courseNo === courseNo) && !course.courseChooseList.find(i => i.courseNo === courseNo)){
        var courseIndex = course.courseData.findIndex(i => i.courseNo === courseNo);
        const targetCourse = course.courseData[courseIndex];
        const myCourse = course.courseChooseList;
        
        // 衝堂
        if (function(){
            var flag = 0;
            targetCourse.time.forEach(time1 => {
                myCourse.forEach(element => {
                    element.time.forEach(time2 => { 
                        if (time1 === time2){
                            flag = 1;
                        }
                    });
                });
            });
            return flag;
        }()){
            status = "Conflict";
            // console.log(status + "衝堂");
            // res.sendFile(__dirname + "/views/A03_Conflict.html");
        }
        // 沒有衝堂 => 成功
        else{
            course.courseChooseList.push(targetCourse);
            status = "Success";
            // console.log(status + "成功加選");
            // res.sendFile(__dirname + "/views/A03_Success.html");
        }
    }
    
    // 有這門課 但 選課清單已經有了 （重複選課）
    else if (course.courseData.find(i => i.courseNo === courseNo) && course.courseChooseList.find(i => i.courseNo === courseNo)){
        status = "Duplicated";
        // console.log(status + "重複選課");
        // res.sendFile(__dirname + "/views/A03_Duplicated.html");
    }
    // 沒有這門課 （課程不存在）
    else{
        status = "NotExist";
        // console.log(status + "課程不存在");
        // res.sendFile(__dirname + "/views/A03_NotExist.html");
    }

    // 更新資料
    modifyJSON();
});

app.listen(3000, function(){
    console.log("Server is running on port 3000");
});

// branch develop

function modifyJSON() {
    var str = JSON.stringify(course);
    fs.writeFile('./course.json', str, function (err) {
        if (err) {
            console.error(err);
        }
        console.log('Modify user in userInfo.json...')
    })
}