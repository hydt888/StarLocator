import fs from 'fs';
import * as astro from '../astronomy.js';
import { getRaDecbyNames } from './fetch.js';

const solarBodies = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];


/**
 * 根据J2000赤经赤纬获取时角和赤纬
 * @param {[number, number]} raDec 赤经赤纬J2000
 * @param {Date} date 日期
 * @returns {[number, number]} 返回时角和赤纬
*/
function getHaDecbyRaDec(raDec, date) {
    const observer = new astro.Observer(0, 0, 0);
    astro.DefineStar("Star1", raDec[0], raDec[1], 1000);
    let equ_ofdate = astro.Equator("Star1", date, observer, true, true);
    let hourAngle = astro.HourAngle("Star1", date, observer);
    return [hourAngle, equ_ofdate.dec];
}


/**
 * 根据太阳系天体名称和日期获取其时角和赤纬
 * @param {string} starName 恒星名称
 * @param {Date} date 日期
 * @returns {[number, number]} 返回时角和赤纬
*/
function getHaDecinSolar(starName, date) {
    // 将name第一个字母大写，其他字母小写
    starName = starName.charAt(0).toUpperCase() + starName.slice(1).toLowerCase();
    const observer = new astro.Observer(0, 0, 0);
    let equ_ofdate = astro.Equator(starName, date, observer, true, true);
    let hourAngle = astro.HourAngle(starName, date, observer);
    return [hourAngle, equ_ofdate.dec];
}


/**
 * 根据恒星名称数组获取其时角和赤纬
 * @param {Array<string>} starNames 恒星名称数组
 * @param {Date} date 日期
 * @returns {Promise<Map<string, [number, number]>>} 返回一个Promise对象，包含时角和赤纬
 */
async function getHaDecbyNames(starNames, date) {
    var text = fs.readFileSync('core/AstroCoord/starZH2EN.json', 'utf8')
    var starZH2EN = JSON.parse(text)
    let fixedStarNames = new Map();  // 太阳系外要查询的恒星名（查询名: 操作名）
    let solarStarNames = new Map();  // 太阳系内要查询的天体名（查询名: 操作名）
    for (let starName of starNames) {
        let operateName = starName;
        // 如果匹配到汉英对照星表，则转换为英文名
        if (starZH2EN[operateName]) {
            operateName = starZH2EN[operateName];
        }
        operateName = operateName.toLowerCase();
        if (solarBodies.includes(operateName)) {
            solarStarNames.set(starName, operateName);
        } else {
            fixedStarNames.set(starName, operateName);
        }
    }
    let HaDecs = new Map();
    // 异步获取恒星的赤经和赤纬
    let raDecs = await getRaDecbyNames(fixedStarNames.values());
    // 同步计算天体的时角和赤纬
    let index = 0;
    for (let starName of fixedStarNames.keys()) {
        HaDecs.set(starName, getHaDecbyRaDec(raDecs[index++], date));
    }
    // 计算太阳系内天体的时角和赤纬
    for (let [starName, operateName] of solarStarNames) {
        HaDecs.set(starName, getHaDecinSolar(operateName, date));
    }
    return HaDecs;
}


export { solarBodies, getHaDecbyNames };