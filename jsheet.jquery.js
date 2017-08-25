;
(function($, window, document, undefined) {
    "use strict";
    /** * --------------------------------------------------------------------
     * @param undefined * 글로벌 전역 변수인 undefined 사용합니다.
     * 단, ES3 에서는 다른 누군가에 의해서 전역 변수인 undefined 를
     * 변경할 수 있기 때문에 실제 undefined 인지 확신할 수 없습니다.
     * ES5 에서 undefined 는 더이상 값을 변경할 수 없습니다.
     * ----

     /** * -------------------------------------------------------------------
      * @param window, document * window, document 는 전역 스코프가 아니라 지역스코프에서 사용하도록 설정
      * 이는 프로세스를 조금 더 빠르게 해결하고 능률적으로 minified 할 수 있다.
      * (특히, 해당 플러그인이 자주 참조될 경우에)
      * ----------------------------------------------------------------------
      */

    // defaults 는 한번만 생성합니다.
    var pluginName = 'jsheet',
        defaults = {
            version: "1.10", // plugin version
            dataMethod: "ajax", // How to import data
            dataType: "json", // Content-Type
            parseURL: "/dev/data.json", // How to import data
            autoCommit: true, // Post-Work DOM Rendering Use or not
            headerGroup: true, // table top header Use or not
            fixedHeader: true, // table fixed header Use or not
            fixedColumn: true, // table fixed column Use or not
            fixedCount: 3, // table fixed column count
            controllerBar: true, // Cell control bar Use or not
            controllerBarItem: [ // glyphicon
                "save",
                "pencil",
                "align-left",
                "align-center",
                "align-right",
                "tasks",
            ],
            filter: true, // table Filter Use or not
            data: null,
            history: [],
        };

    // plugin constructor
    function Plugin(element, options) {
        /** * ----------------------------------------------------------------
         * 제이쿼리는 두개 또는 그 이상의 객체들을 첫번째 객체에
         * 저장하여 병합,확장할 수 있는 $.extend 유틸리티를 소유하고 있습니다.
         * 일반적으로 첫번째 객체에 {}, 빈 객체를 설정하여 * 플러그인 인스턴스에 대한 default option(기본옵션)을
         * 변경시키지 않도록 하기 위함입니다.
         * ---------------------------------------------------------------- */
        this.element = element;
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype.init = function() {
        /** * ----------------------------------------------------------------
         * 이곳에 초기화 로직을 작성합니다.
         * 여러분은 이미 인스턴스를 통해 DOM 요소, options 을 사용할 수 있습니다.
         * (예. this.element, this.options)
         * ------------------------------------------------------------------ */
        this.loadData();
    };

    Plugin.prototype.loadData = function() {
        // make loader options
        var loader_options = { //global
            target:        this.element,
            type:          "outer",
            spin_second:   "0.5s",
            loader_margin: "-150px 0px 0px 0px"
        };

        if (this.options.dataMethod) {
            // get data
            this.func(this.options.dataMethod, {
                url: this.options.parseURL,
                func: "deaultLender2Element",
                data: this.options.data,
                loader_options: loader_options,
            });
        }
    };

    // 기본 테이블 생성
    Plugin.prototype.deaultLender2Element = function(data) {
        // set data to module
        this.options.data = data;

        if (this.options.controllerBar) {
            var controllerBar = this.createControllerBar();
            this.element.appendChild(controllerBar);
        }

        var contents = document.createElement("DIV");
        contents.className = "jsheet-table";

        var header = this.createHeader();
        var body   = this.createBody();

        contents.appendChild(header);
        contents.appendChild(body);

        this.element.appendChild(contents);


        this.func("sync");

        // return this.domLender({
        //     terget: this,
        //     html: lenderElement
        // });
    };

    // Create Table Header Element / 테이블 헤더 생성
    Plugin.prototype.createHeader = function() {
        var table_warp_div = document.createElement("DIV");
        var table          = document.createElement("TABLE");
        var thead          = document.createElement("THEAD");
        var col_data       = this.options.data.col_data;

        table_warp_div.className = "jsheet-table-header-warp";
        table.className = "jsheet-table-header";

        table_warp_div.appendChild(table);

        // 그룹 헤더가 존재 할 경우.
        if (this.options.headerGroup) {
            var group_col_th   = document.createElement("TR"),
                col_th         = document.createElement("TR"),
                tmp_group_name = "",
                col_span       = 1;

            // 헤더 데이터 드로잉 반복문
            for (var idx in col_data) {
                var info     = JSON.parse(col_data[idx]["CHANGE_COLUMN_INFO"]);
                var th_group = document.createElement("TH");
                var th_col   = document.createElement("TH");

                th_col.innerHTML          = col_data[idx]["COMMENT"];
                th_col.dataset.column_seq = col_data[idx]["COLUMN_SEQ"];
                th_col.style.minWidth     = info["WIDTH"] + "px";

                // 그룹인지 아닌지 해당 조건으로 체크
                if (col_data[idx]["GROUP_NO"] == 0) {
                    // 그룹이 아닐 경우
                    th_group.colSpan   = 1;
                    th_group.innerHTML = col_data[idx]["GROUP_NAME"];
                    group_col_th.appendChild(th_group);
                } else {
                    // 그룹일 경우
                    if (tmp_group_name == "") {
                        // 그룹 네임이 없을 경우 첫 그룹으로 간주
                        col_span       = 1;
                        tmp_group_name = col_data[idx]["GROUP_NAME"];

                    } else if (idx == (col_data.length - 1)) {
                        // 가장 마지막 열 일 경우
                        th_group.colSpan   = (col_span + 1);
                        th_group.innerHTML = tmp_group_name;
                        group_col_th.appendChild(th_group);

                    } else if (tmp_group_name != col_data[idx]["GROUP_NAME"]) {
                        // 그룹명이 달라질 경우 새로운 그룹으로 매핑
                        th_group.colSpan = col_span;
                        th_group.innerHTML = tmp_group_name;
                        group_col_th.appendChild(th_group);

                        col_span = 1;
                        tmp_group_name = col_data[idx]["GROUP_NAME"];

                    } else {
                        // 이전 그룹과 같은 그룹일 경우
                        col_span += 1;
                    }
                }
                // 고정 열의 수의 따라 클래스 부여
                if (this.options.fixedHeader && idx < this.options.fixedCount) {
                    th_group.className = "col-fixed";
                    th_col.className   = "col-fixed";
                    col_th.appendChild(th_col);
                }

                col_th.appendChild(th_col);
            }
            thead.appendChild(group_col_th);
            thead.appendChild(col_th);

            table.appendChild(thead);

        }
        // 그룹 헤더가 없을 경우 else
        table_warp_div.appendChild(table);

        // fixed 일때
        if (this.options.fixedHeader)
        {
            var c_table  = document.createElement("TABLE"),
                thead    = document.createElement("THEAD"),
                tr_group = document.createElement("TR"),
                tr_col   = document.createElement("TR"),
                fixed_th = $(table).find("th.col-fixed").clone(),
                for_idx  = (fixed_th.length/2);

            c_table.className = "jsheet-table-header-fixed";

            for (var i = 0; i < for_idx; i++) {
                tr_group.appendChild(fixed_th[i]);
                tr_col.appendChild(fixed_th[i+for_idx]);
            }

            thead.appendChild(tr_group);
            thead.appendChild(tr_col);
            c_table.appendChild(thead);
            table_warp_div.appendChild(c_table);
        }
        return table_warp_div;
    };

    // Create Table Body Element / 테이블 바디 생성
    Plugin.prototype.createBody = function() {
        var table_warp_div = document.createElement("DIV");
        var table_warp_body_div = document.createElement("DIV");
        var table          = document.createElement("TABLE");

        table_warp_div.className = "jsheet-table-body-warp";
        table.className = "jsheet-table-body";

        var tbody = document.createElement("TBODY");
        var r     = this.options.data.row_data;

        // 행 드로잉 반복문
        for (var i in r) {
            var tr   = document.createElement("TR");
            var c_d  = r[i]["ROW_LIST"];
            // 열 드로잉 반복문
            for (var c_i in c_d) {
                var td   = document.createElement("TD");
                var info = JSON.parse(c_d[c_i]["CHANGE_COLUMN_INFO"])

                td.dataset.cglist_seq = c_d[c_i]["CGLIST_SEQ"];
                td.dataset.column_seq = c_d[c_i]["COLUMN_SEQ"];
                td.style.minWidth        = info["WIDTH"]+"px";
                td.style.maxWidth        = info["WIDTH"]+"px";
                td.innerHTML          = c_d[c_i]["DATA"];

                if (info["FIXED"] == "Y") $(td).addClass('fixed-cell');
                if (info["TYPE"] != "text" || info["TYPE"] != "textarea") $(td).addClass('disable');
                tr.appendChild(td);

            }
            tbody.appendChild(tr);
            table.appendChild(tbody);
        }

        // fixed 일때
        if (this.options.fixedHeader)
        {
            var c_table  = document.createElement("TABLE"),
                tbody    = document.createElement("TBODY"),
                tr_col   = document.createElement("TR"),
                o_table  = $(table).find("td.fixed-cell"),
                fixed_th = o_table.clone(),
                for_idx  = (fixed_th.length);

            c_table.className = "jsheet-table-body-fixed";

            for (var i = 0; i < for_idx; i++) {
                // console.log($(fixed_th[i]).height());
                tr_col.appendChild(fixed_th[i]);
                if (((i+1) % 3) === 0 )
                {
                    tbody.appendChild(tr_col);
                    tr_col = document.createElement("TR")
                }
            }
            c_table.appendChild(tbody);
            table_warp_div.appendChild(c_table);
        }
        table_warp_div.appendChild(table);
        return table_warp_div;
    };

    // Create ControllerBar Element / 제어창 생성
    Plugin.prototype.createControllerBar = function() {
        var controll_bar       = document.createElement("DIV");
        controll_bar.className = "controll-bar";

        var list       = document.createElement("UL");
        list.className = "controll-bar-list";

        for (var item_index in this.options.controllerBarItem) {
            var item = this.options.controllerBarItem[item_index];
            var li   = document.createElement("LI");
            var span = document.createElement("SPAN");

            li.className   = "controll-bar-list-item";
            span.className = "glyphicon glyphicon-" + item;

            li.appendChild(span);
            list.appendChild(li);
        }
        controll_bar.appendChild(list);

        return controll_bar;
    };

    Plugin.prototype.domLender = function(info) {
        // 수정된 엘리먼트 렌더링
        console.log("domLender");
        console.log(info);
    };

    Plugin.prototype.parser = function() {
        // html 테이블에서 데이터를 파싱
    };

    Plugin.prototype.sync = function() {
        // 가로 스크롤 동기화
        $(".jsheet-table-body").scroll(function(event) {
            $(".jsheet-table-header").scrollLeft($(this).scrollLeft());
            $(".jsheet-table-body-fixed").scrollTop($(this).scrollTop());
        });
        
        // 테이블 height 동기화
        $(".jsheet-table-body").find("tr").each(function(index, el) {
            $( ".fixed-cell:nth-child("+index+")" ).height($(el).height());
        });
    };

    Plugin.prototype.ajax = function(info) {
        var _plugin = this;

        return $.ajax({
            dataType: this.options.dataType,
            url: info.url,
            data: info.data,
            beforeSend: function() {
                window.loader.create(info.loader_options);
            },
            success: function(result) {
                _plugin.func(info.func, result);
            },
            complete: function() {
                window.loader.remove();
            },
        });
    };

    Plugin.prototype.func = function(funcName, data) {
        // module inner function call / 내부 함수 호출
        return this[funcName](data);
    };

    /** * --------------------------------------------------------------------------
     * 생성자(예. new Plugin()) 주변에 여러개의 인스턴스 생성을 방지하기 위해
     * 가벼운 플러그인 래퍼를 설정합니다.
     * data 메소드를 이용하여 cache 해 두게 됩니다.
     * (한번 생성된 인스턴스는 더이상 같은 인스턴스를 생성하지 않도록 하기 위함입니다.)
     * -------------------------------------------------------------------------- */
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                    new Plugin(this, options));
            }
        });
    }

})(jQuery, window, document);