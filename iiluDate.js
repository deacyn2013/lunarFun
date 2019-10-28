'use strict';

/**
 * 没有特殊说明，牵扯到的日期都为公历日期，农历日期会特别说明
 */

let iiluDate = {
    /**
     * 农历年份信息，取自 [香港天文台](https://gb.weather.gov.hk/gts/time/conversionc.htm)
     * 农历年份信息和公历不一样，没有规律可遵循，都是由天文台观测计算。
     * 由于计算数十年后的月相及节气时间可能会有数分钟的误差，若新月(即农历初一)或节气时间很接近午夜零时，相关农历月份或节气的日期可能会有一日之差别。
     * 这些情况会出现在
     *     - 2057年09月28日、2089年09月04日 、 2097年08月07日 的新月
     *     - 2021年的冬至(2021年12月21日)、2051年的春分(2051年03月20日)、2083年的立春(2083年02月03日)、2084年的春分(2084年03月19日)
     * lunarInfo 的数据介绍
     *     - 数组的每一个项表示一个农历年份，例如：农历 1906 年是 [4, 1, 25, 27304]
     *     - 年份数组的第一个项判断当前年份是否是闰年，如果是则数字表示闰几月，如果不是则数字为 0
     *     - 年份数组的第二个项和第三个项分别表示农历正月初一对应的公历月和日
     *         + 例如：农历 1906 年是 [4, 1, 25, 27304]，表示农历 1906年的正月初一 对应公历 1906年01月25日 是同一天。
     *     - 年份数组的第四个参数是十进制数，存储了年份的所有月份天数信息，转为月份天数遵循如下规则
     *         + 十进制数转为十六位二进制数，如果转为二进制后不足十六位，则在前面补零，直到满足十六位
     *         + 如果是闰年则取十六位二进制数的前 13 位(有闰月)，如果不是闰年则取十六位二进制数的前 12 位。（从左往右数）
     *         + 取得的 12 位或 13 位数，每一位分别加上 29 得到的数就是那月的天数，假设第三个数字是 1 加上 29 后是 30 则表示第三个月是 30天，以此类推
     *     - 上面说了十进制数如何转为月份天数，下面说明农历年份的月份天数如何转为十进制数
     *         + 农历月份分大小月，大月 30 天，小月 29 天。
     *         + 一月份到十二月份天数依次排列，分别都减去 29 ，得到了一组由 1 或者 0 组成的二进制数，如果这个数不足 16 位则在后面补 0，
     *         + 之后得到的十六位二进制数转为十进制
     */
    MIN_YEAR: 1891, // 农历年份信息的最小年份
    MAX_YEAR: 2100, // 农历年份信息的最大年份
    lunarInfo: [
        [0, 2, 9, 21936], [6, 1, 30, 9656], [0, 2, 17, 9584], [0, 2, 6, 21168], [5, 1, 26, 43344], // 1891 - 1895
        [0, 2, 13, 59728], [0, 2, 2, 27296], [3, 1, 22, 44368], [0, 2, 10, 43856], [8, 1, 30, 19304], // 1896 - 1900
        [0, 2, 19, 19168], [0, 2, 8, 42352], [5, 1, 29, 21096], [0, 2, 16, 53856], [0, 2, 4, 55632], // 1901 - 1905
        [4, 1, 25, 27304], [0, 2, 13, 22176], [0, 2, 2, 39632], [2, 1, 22, 19176], [0, 2, 10, 19168], // 1906 - 1910
        [6, 1, 30, 42200], [0, 2, 18, 42192], [0, 2, 6, 53840], [5, 1, 26, 54568], [0, 2, 14, 46400], // 1911 - 1915
        [0, 2, 3, 54944], [2, 1, 23, 38608], [0, 2, 11, 38320], [7, 2, 1, 18872], [0, 2, 20, 18800], // 1916 - 1920
        [0, 2, 8, 42160], [5, 1, 28, 45656], [0, 2, 16, 27216], [0, 2, 5, 27968], [4, 1, 24, 44456], // 1921 - 1925
        [0, 2, 13, 11104], [0, 2, 2, 38256], [2, 1, 23, 18808], [0, 2, 10, 18800], [6, 1, 30, 25776], // 1926 - 1930
        [0, 2, 17, 54432], [0, 2, 6, 59984], [5, 1, 26, 27976], [0, 2, 14, 23248], [0, 2, 4, 11104], // 1931 - 1935
        [3, 1, 24, 37744], [0, 2, 11, 37600], [7, 1, 31, 51560], [0, 2, 19, 51536], [0, 2, 8, 54432], // 1936 - 1940
        [6, 1, 27, 55888], [0, 2, 15, 46416], [0, 2, 5, 22176], [4, 1, 25, 43736], [0, 2, 13, 9680], // 1941 - 1945
        [0, 2, 2, 37584], [2, 1, 22, 51544], [0, 2, 10, 43344], [7, 1, 29, 46248], [0, 2, 17, 27808], // 1946 - 1950
        [0, 2, 6, 46416], [5, 1, 27, 21928], [0, 2, 14, 19872], [0, 2, 3, 42416], [3, 1, 24, 21176], // 1951 - 1955
        [0, 2, 12, 21168], [8, 1, 31, 43344], [0, 2, 18, 59728], [0, 2, 8, 27296], [6, 1, 28, 44368], // 1956 - 1960
        [0, 2, 15, 43856], [0, 2, 5, 19296], [4, 1, 25, 42352], [0, 2, 13, 42352], [0, 2, 2, 21088], // 1961 - 1965
        [3, 1, 21, 59696], [0, 2, 9, 55632], [7, 1, 30, 23208], [0, 2, 17, 22176], [0, 2, 6, 38608], // 1966 - 1970
        [5, 1, 27, 19176], [0, 2, 15, 19152], [0, 2, 3, 42192], [4, 1, 23, 53864], [0, 2, 11, 53840], // 1971 - 1975
        [8, 1, 31, 54568], [0, 2, 18, 46400], [0, 2, 7, 46752], [6, 1, 28, 38608], [0, 2, 16, 38320], // 1976 - 1980
        [0, 2, 5, 18864], [4, 1, 25, 42168], [0, 2, 13, 42160], [10, 2, 2, 45656], [0, 2, 20, 27216], // 1981 - 1985
        [0, 2, 9, 27968], [6, 1, 29, 44448], [0, 2, 17, 43872], [0, 2, 6, 38256], [5, 1, 27, 18808], // 1986 - 1990
        [0, 2, 15, 18800], [0, 2, 4, 25776], [3, 1, 23, 27216], [0, 2, 10, 59984], [8, 1, 31, 27432], // 1991 - 1995
        [0, 2, 19, 23232], [0, 2, 7, 43872], [5, 1, 28, 37736], [0, 2, 16, 37600], [0, 2, 5, 51552], // 1996 - 2000
        [4, 1, 24, 54440], [0, 2, 12, 54432], [0, 2, 1, 55888], [2, 1, 22, 23208], [0, 2, 9, 22176], // 2001 - 2005
        [7, 1, 29, 43736], [0, 2, 18, 9680], [0, 2, 7, 37584], [5, 1, 26, 51544], [0, 2, 14, 43344], // 2006 - 2010
        [0, 2, 3, 46240], [4, 1, 23, 46416], [0, 2, 10, 44368], [9, 1, 31, 21928], [0, 2, 19, 19360], // 2011 - 2015
        [0, 2, 8, 42416], [6, 1, 28, 21176], [0, 2, 16, 21168], [0, 2, 5, 43312], [4, 1, 25, 29864], // 2016 - 2020
        [0, 2, 12, 27296], [0, 2, 1, 44368], [2, 1, 22, 19880], [0, 2, 10, 19296], [6, 1, 29, 42352], // 2021 - 2025
        [0, 2, 17, 42208], [0, 2, 6, 53856], [5, 1, 26, 59696], [0, 2, 13, 54576], [0, 2, 3, 23200], // 2026 - 2030
        [3, 1, 23, 27472], [0, 2, 11, 38608], [11, 1, 31, 19176], [0, 2, 19, 19152], [0, 2, 8, 42192], // 2031 - 2035
        [6, 1, 28, 53848], [0, 2, 15, 53840], [0, 2, 4, 54560], [5, 1, 24, 55968], [0, 2, 12, 46496], // 2036 - 2040
        [0, 2, 1, 22224], [2, 1, 22, 19160], [0, 2, 10, 18864], [7, 1, 30, 42168], [0, 2, 17, 42160], // 2041 - 2045
        [0, 2, 6, 43600], [5, 1, 26, 46376], [0, 2, 14, 27936], [0, 2, 2, 44448], [3, 1, 23, 21936], // 2046 - 2050
        [0, 2, 11, 37744], [8, 2, 1, 18808], [0, 2, 19, 18800], [0, 2, 8, 25776], [6, 1, 28, 27216], // 2051 - 2055
        [0, 2, 15, 59984], [0, 2, 4, 27424], [4, 1, 24, 43872], [0, 2, 12, 43744], [0, 2, 2, 37600], // 2056 - 2060
        [3, 1, 21, 51568], [0, 2, 9, 51552], [7, 1, 29, 54440], [0, 2, 17, 54432], [0, 2, 5, 55888], // 2061 - 2065
        [5, 1, 26, 23208], [0, 2, 14, 22176], [0, 2, 3, 42704], [4, 1, 23, 21224], [0, 2, 11, 21200], // 2066 - 2070
        [8, 1, 31, 43352], [0, 2, 19, 43344], [0, 2, 7, 46240], [6, 1, 27, 46416], [0, 2, 15, 44368], // 2071 - 2075
        [0, 2, 5, 21920], [4, 1, 24, 42448], [0, 2, 12, 42416], [0, 2, 2, 21168], [3, 1, 22, 43320], // 2076 - 2080
        [0, 2, 9, 26928], [7, 1, 29, 29336], [0, 2, 17, 27296], [0, 2, 6, 44368], [5, 1, 26, 19880], // 2081 - 2085
        [0, 2, 14, 19296], [0, 2, 3, 42352], [4, 1, 24, 21104], [0, 2, 10, 53856], [8, 1, 30, 59696], // 2086 - 2090
        [0, 2, 18, 54560], [0, 2, 7, 55968], [6, 1, 27, 27472], [0, 2, 15, 22224], [0, 2, 5, 19168], // 2091 - 2095
        [4, 1, 25, 42216], [0, 2, 12, 42192], [0, 2, 1, 53584], [2, 1, 21, 55592], [0, 2, 9, 54560] // 2096 - 2100
    ],
    HeavenlyStems: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
    EarthlyBranches: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    Zodiac: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
    chineseMonth: ['正', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'],
    chineseDate: ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '初', '廿', '卅'], // 廿: nian; 卅: sa; 都读四声
    chineseSolarTerms: ['立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'],

    /**
     * 判断输入的公历年份是否是闰年
     * @param year
     * @returns {boolean}
     */
    isLeapYear(year) {
        /**
         * 现在的公历是格里高利历，是公元1582年以后使用的，之前使用的是儒略历。
         * 格里高利历闰年的定义：世纪年中能被400整除的，和非世纪年中能被4整除的年份(即能被400整除的，或者不能被100整除而能被4整除的年份)
         * 儒略历闰年的定义：能被4整除的年份。
         */

        /**
         * 使用一元运算符 + 来转换数字对于 parseInt() 和 parseFloat() 来转换数字说有一个地方表现不一致
         * 对于 '123abc' 前者转为 NaN , 后者转为 123
         */

        let yearNum = +year;

        if (Number.isNaN(yearNum)) {
            console.warn('输入的年份参数有误');
            return false;
        }

        if (yearNum < 1582) {
            // 儒略历闰年
            return (yearNum % 4 === 0);
        } else {
            // 格里高利历闰年
            return (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0);
        }
    },

    /**
     * 传入公历年份，输出天干，如果参数错误返回空字符串
     * @param year
     * @returns {string}
     */
    getHeavenlyStems(year) {
        /**
         * 公元年数先减 3，除以 10 余数所对应的的天干是数组 HeavenlyStems 里的第几个项。也就是余数 -1 作为数组下标得出的值
         * 以 2010(庚寅) 年为例，年份减 3 得基数 2007 ,除以 10 得余数 7, 第 7 个是 '庚'。 也就是 HeavenlyStems[7-1] 为 '庚'
         */

        let yearNum = +year;

        if (Number.isNaN(yearNum)) {
            console.warn('输入的年份参数有误');
            return '';
        }

        let i = (yearNum - 3) % 10;
        if (i === 0) {// 余数为 0 的项及时第 10 个项
            i = 10;
        }

        return this.HeavenlyStems[i - 1];
    },

    /**
     * 传入公历年份，输出地支，如果参数错误返回空字符串
     * @param year
     * @returns {string}
     */
    getEarthlyBranches(year) {
        /**
         * 公元年数先减 3，除以 12 余数所对应的的地支是数组 EarthlyBranches 里的第几个项。也就是余数 -1 作为数组下标得出的值
         * 以 2010(庚寅) 年为例，年份减 3 得基数 2007 ,除以 12 得余数 3, 第 3 个是 '寅'。 也就是 EarthlyBranches[3-1] 为 '庚'
         */

        let yearNum = +year;

        if (Number.isNaN(yearNum)) {
            console.warn('输入的年份参数有误');
            return '';
        }

        let i = (yearNum - 3) % 12;
        if (i === 0) { // 余数为 0 的项及时第 12 个项
            i = 12;
        }

        return this.EarthlyBranches[i - 1];
    },

    /**
     * 传入公历年份，输出生肖，如果参数错误返回空字符串
     * @param year
     * @returns {string}
     */
    getZodiac(year) {
        /**
         * 公元年数先减 3，除以 12 余数所对应的的生肖是数组 Zodiac 里的第几个项。也就是余数 -1 作为数组下标得出的值
         * 以 2010(虎) 年为例，年份减 3 得基数 2007 ,除以 12 得余数 3, 第 3 个是 '虎'。 也就是 Zodiac[3-1] 为 '虎'
         */

        let yearNum = +year;

        if (Number.isNaN(yearNum)) {
            console.warn('输入的年份参数有误');
            return '';
        }

        let i = (yearNum - 3) % 12;
        if (i === 0) { // 余数为 0 的项及时第 12 个项
            i = 12;
        }

        return this.Zodiac[i - 1];
    },

    /**
     * 传入公历年份和月份，输出对应月份的天数
     * @param year
     * @param month
     * @returns {number}
     */
    getMonthNumberDays(year, month) {
        let FebDays = this.isLeapYear(year) ? 29 : 28;
        let monthNumberDaysArr = ['', 31, FebDays, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return monthNumberDaysArr[month];
    },

    /**
     * 传入农历年份和月份，输出对应月份的天数，第三个参数是输入的月份是否为闰月，默认为 false
     * 假设传入的是 (1903, 4);       表示 输出 农历1906年 4月 的天数
     * 假设传入的是 (1906, 4, true); 表示 输出 农历1906年 润4月 的天数（第三个参数生效的前提是输入的是闰年，且月搞好是闰）
     * @param year
     * @param month
     * @param run
     * @returns {number}
     */
    getLunarMonthNumberDays(year, month, isRun = false) {

        let yearData = this.lunarInfo[year - this.MIN_YEAR]; // 农历年份数据 例如：[4, 1, 25, 27304]
        let monthNumberDaysArr = this.getLunarMonthNumberDaysArr(+year); // 农历所有月份天数组成的数组
        let monthNumber = 0; // 需要返回的天数
        let run = yearData[0]; // 是否是闰年，0 || 闰几月

        if (run === 0) { // 不是闰年，第三个参数无效
            monthNumber = monthNumberDaysArr[month - 1];
        } else { // 是闰年
            if (run > month) { // 是闰年，且闰月比当前输入的月份大，第三个参数无效
                monthNumber = monthNumberDaysArr[month - 1];
            }
            else if (run < month) { // 是闰年，且闰月比当前输入的月份小，第三个参数无效
                monthNumber = monthNumberDaysArr[month]; // 这里考虑到闰月会占用一个月份位置，所以下标不再 -1
            }
            else if ((+run === +month) && !isRun) { // 是闰年，且闰月和输入的月份相同，第三个参数为 false
                monthNumber = monthNumberDaysArr[month - 1]; // 虽然输入的月份和闰月相同，第三个参数为 false 说明想要的是普通月份天数
            }
            else if ((+run === +month) && isRun) { // 是闰年，且闰月和输入的月份相同，第三个参数为true
                monthNumber = monthNumberDaysArr[month]; // 输入的月份和闰月相同，第三个参数为 true，说明想要的是闰月天数
            }
        }

        return +monthNumber;
    },

    /**
     * 传入农历年份，输出农历年的所有月份天数数组，闰年13个月，非闰年12个月，即数组长度为 13 或者 12
     * 如果传入的参数不规范，则返回空数组
     * @param year
     * @returns {number[]}
     */
    getLunarMonthNumberDaysArr(year) {
        if (!year) {
            console.warn('输入的年份参数有误');
            return [];
        }

        let yearData = this.lunarInfo[year - this.MIN_YEAR]; // 农历年份数据 例如：[4, 1, 25, 27304]
        console.log(yearData)
        let run = yearData[0]; // 是否是闰年，0 || 闰几月
        let binaryArr = (+yearData[3]).toString(2).split(''); // 二进制字符串分解的数组
        console.log(binaryArr)
        if (run === 0) { // 非闰年
            binaryArr.length = 12;
        } else { // 闰年
            binaryArr.length = 13;
        }
        // 所有月份天数组成的数组
        let monthNumberDaysArr = binaryArr.map((item, index) => {
            return +item + 29;
        });

        return monthNumberDaysArr;
    },

    /**
     * 传入农历年份，输出那年所有的天数
     * 如果传入的参数不规范，则返回 0
     * @param year
     */
    getLunarYearDaysTotal(year) {
        if (!year) {
            console.warn('输入的年份参数有误');
            return 0;
        }
        let monthsArr = this.getLunarMonthNumberDaysArr(year); // 农历所有月份天数组成的数组
        if (monthsArr.length === 0) {
            console.warn('输入的年份参数有误');
            return 0;
        }
        let yearDaysTotal = monthsArr.reduce((accumulator, currentValue) => {
            return (accumulator - 0) + (currentValue - 0);
        });

        return yearDaysTotal
    },

    /**
     * 输入农历日期，输出日期距离那年正月初一的天数
     * 第4个参数是输入的月份是否为闰月，默认为 false
     * @param year
     * @param month
     * @param day
     * @param run
     * @returns {number}
     */
    distanceLunarFirstDays(year, month, day, isRun = false) {
        let yearData = this.lunarInfo[year - this.MIN_YEAR]; // 农历年份数据 例如：[4, 1, 25, 27304]
        let monthNUmberDaysArr = this.getLunarMonthNumberDaysArr(+year); // 农历所有月份天数组成的数组
        let run = +yearData[0]; // 闰月信息
        let distanceDays = 0;

        // 输入数量，返回 yearData 相应的前几项之和
        function addNum(num) {
            let nums = 0;
            for (let i=0; i<num; i++) {
                nums += monthNUmberDaysArr[i];
            }
            return nums;
        }

        if (run === 0) { // 非闰年
            distanceDays = addNum(month - 1);
        } else { // 闰年
            if (run > month) {
                distanceDays = addNum(month - 1);
            }
            else if (run < month) {
                distanceDays = addNum(month);
            }
            else if (run === +month && !isRun) { // 输入的月份和闰月相同，但 isRun 为 false，month 为正常月份
                distanceDays = addNum(month - 1);
            }
            else if (run === +month && isRun) { // 输入的月份和闰月相同，但 isRun 为 true，month 为闰月
                distanceDays = addNum(month);
            }
        }
        return distanceDays;
    },

    /**
     * 输入两个公历日期对象，输出两个日期间隔的天数
     * @param date1
     * @param date2
     * @returns {number}
     */
    distanceDate(date1, date2) {
        // 这里注意如果是手动 new Date(y, m, d); 来声明日期对象，月份要 -1，因为js日期对象月份从0开始 0-11
        let distance = date1 - date2; // 以毫秒计的运行时长
        let distanceDays = Math.floor(Math.abs(distance) / 1000 / 60 / 60 / 24); // 相差的毫秒数转为天数
        return distanceDays;
    },

    /**
     * 输入规定格式的日期字符串，返回其拆分后的数字数组, 格式必须如例子  'YYYY-MM-DD' 或者 'YYYY-MM-DD hh:mm:ss'
     * 如果格式错误，则返回空数组
     * @param str
     * @returns {Array|number[]}
     */
    getDateNumArr(str) {
        if (!str) {
            console.warn('请输入正确的日期字符串');
            return [];
        }

        let ymdReg = /^\d{4}-\d{2}-\d{2}$/;
        let hmsReg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        let isByReg = false; // 是否通过了 正则验证

        if (hmsReg.test(str) || ymdReg.test(str)) {
            isByReg = true;
        }
        if (!isByReg) { // 如果没通过正则验证
            console.warn('请输入正确的日期字符串');
            return [];
        }


        let ymdNumArr = []; // 年月日数组
        let hmsNumArr = []; // 时分秒数组

        let ymdStrArr = str.split(' ')[0].split('-');
        ymdNumArr = ymdStrArr.map((item, index) => {
            return item - 0;
        });

        if (str.split(' ')[1]) { // 如果存在时分秒
            let hmsStrArr = str.split(' ')[1].split(':');
            hmsNumArr = hmsStrArr.map((item, index) => {
                return item - 0;
            })
        }

        return [...ymdNumArr, ...hmsNumArr];
    },


    /**
     * 输入公历年月日，返回其日期对象
     * 因为月份在日期对象里面需要 -1(js日期对象月份从0开始 0-11)，时常忘记，所以这里写一个方法
     * @param year
     * @param month
     * @param day
     * @returns {Date}
     */
    getDateYMD(year, month, day) {
        return new Date(+year, month - 1, +day);
    },

    /**
     * 传入公历年月日返回农历年月日数组
     * 数组的第四个项是在年份为闰年的时候决定输出的月份是否是闰月
     */
    gregorianToLunal(year, month, day) {
        let yearData = this.lunarInfo[year - this.MIN_YEAR]; // 根据输入年份查询相应农历年份数据 例如：[4, 1, 25, 27304]
        let firstDayMonth = +yearData[1]; // 对应年份正月初一的月份信息
        let firstDayDat = +yearData[2]; //  对应年份的正月初一的天数信息

        /**
         * 以输入年份的农历正月初一对应的月份和天数来作为基准
         * 如果输入的月份和天数比基准 大，说明输出的农历年份是同年
         * 如果输入的月份和天数比基准 小，说明输出的农历年份要比同年公历小一年
         */
        let compare = 0; // 0 表示输入的月份天数和基准一致 || 1 表示输入的月份天数比基准 大 || -1 表示输入的月份天数比基准 小
        if (month > firstDayMonth) { // 输入的月份和比正月初一对应的月份大，
            compare = 1;
        } else if (month < firstDayMonth) { // 输入的月份比正月初一对应的月份小,
            compare = -1;
        } else if (+month === firstDayMonth) { // 输入的月份和正月初一的月份相同，这个时候比较天数
            if (day > firstDayDat) {
                compare = 1;
            } else if (day < firstDayDat) {
                compare = -1;
            } else if (+day ===firstDayDat) { // 输入的公历年月日刚好和同年的农历对应的正月初一相同
                compare = 0;
            }
        }

        let lunalYear = 0; // 输出的阴历年份
        let lunalMonth = 0; // 输出的阴历月份(闰月则+1，后面的月份一次+1)
        let lunalDay = 0; // 输出的阴历天
        let lunalIsRun = false; // 如果输出的阴历年份是闰年，此参数有效，判断输出的月份是否是闰月， 默认false

        if (compare === 1) { // 输入的月份天数比基准 大， 使用同输入年份的农历年份数据
            lunalYear = +year;
            let differDays = this.distanceDate(this.getDateYMD(year, +yearData[1], +yearData[2]), this.getDateYMD(year, month, day)); // 输入的公历年月日和对应当年农历正月初一相差的天数
            console.log(differDays);
            let monthNUmberDaysArr = this.getLunarMonthNumberDaysArr(+year); // 农历所有月份天数组成的数组
            console.log(monthNUmberDaysArr)
            let monthSum = []; // 农历月份依次相加的数组，例如第一个项是 1月， 第二个项是 1月+2月，第三个项是 1月+2月+3月
            monthNUmberDaysArr.reduce((accumulator, currentValue) => {
                monthSum.push(accumulator + currentValue);
                return accumulator + currentValue
            }, 0);
            console.log(monthSum);
            for (let i=0, len=monthSum.length; i<len; i++) {
                if (monthSum[i] >= differDays) {
                    lunalMonth = i+1; // 月份，monthSum 的第几项比 differDays 大，就表示是第几月，项的第几位是下标 + 1
                    lunalDay = monthNUmberDaysArr[i] - (monthSum[i] - differDays) + 1; // 天数，天数 = 月份的天数 - (前几个月的总和 - 相差天数) + 1；
                    break;
                }
            }

            let run = +yearData[0]; // 闰月信息
            if (run && lunalMonth > run) {
                /**
                 * 如果当前是闰年，且 lunalMonth 比 闰月 小，lunalMonth 不变
                 * 如果当前是闰年，且 lunalMonth 和 闰月 相等，lunalMonth 不变
                 * 如果当前是闰年，且 lunalMonth 比 闰月 大
                 * 如果刚好比闰月 大 1个月， 则lunalMonth - 1 且 lunalIsRun 为 true
                 * 如果比闰月大很多，则lunalMonth - 1
                 */
                if (lunalMonth > (run + 1)) {
                    lunalMonth = lunalMonth - 1;
                } else if (lunalMonth === (run + 1)) {
                    lunalMonth = lunalMonth - 1;
                    lunalIsRun = true;
                }
            }
            console.log([+lunalYear, +lunalMonth, +lunalDay, lunalIsRun])






        }
        else if (compare === -1) { // 输入的月份天数比基准 小，使用同输入年份 上一年 的农历数据

        }
        else if (compare === 0) { // 输入的月份天数和基准一致
            lunalYear = +year;
            lunalMonth = 1;
            lunalDay = 1;
        }

        return [+lunalYear, +lunalMonth, +lunalDay, lunalIsRun];
    },

    /**
     * 传入农历返回公历年月日数组，第四个
     * @param year
     * @param month
     * @param day
     * @param isRun
     */
    lunalToGregorian(year, month, day, isRun = false) {

    },


};
