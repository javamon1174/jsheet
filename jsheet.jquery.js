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
        var loader_options = {
            target: this.element,
            type: "outer",
            spin_second: "0.5s",
            border: "15px",
            width: "20px",
            height: "20px",
            in_color: "#838383",
            out_color: "rgba(255, 255, 255, 0.7)",
            dim_top: "0",
            dim_color: "#E0E0E0",
            loader_margin: "0px 0px 0px 0px"
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
        contents.className = "jsheet-contents";

        var table = document.createElement("TABLE");
        table.className = "jsheet-table table";

        var header = this.createHeader();
        table.appendChild(header);

        contents.appendChild(table);
        this.element.appendChild(contents);
        return;

        var body = this.createBody();
        table.appendChild(body);


        contents.appendChild(table);
        this.element.appendChild(contents);

        return this.domLender({
            terget: this,
            html: lenderElement
        });
    };

    // Create Table Header Element / 테이블 헤더 생성
    Plugin.prototype.createHeader = function() { //check options => [fixedHeader, fixedColumn, fixedCount, controllerBar]
        var header = document.createElement("HEADER");
        var col_data = this.options.data.col_data;

        // 그룹 헤더가 존재 할 경우.
        if (this.options.headerGroup) {
            var group_col_th   = document.createElement("TR");
            var col_th         = document.createElement("TR");
            var tmp_group_name = "";
            var col_span       = 1;

            // 헤더 데이터 드로잉 반복문
            for (var idx in col_data) {
                var th_group              = document.createElement("TH");
                var th_col                = document.createElement("TH");

                th_col.innerHTML          = col_data[idx]["COMMENT"];
                th_col.dataset.column_seq = col_data[idx]["COLUMN_SEQ"];
                th_col.style.minWidth     = col_data[idx]["WIDTH"] + "px";

                if (idx < this.options.fixedCount)
                {
                    th_group.className = "col-fixed";
                    th_col.className   = "col-fixed";
                }

                if (col_data[idx]["GROUP_NO"] == 0) {
                    th_group.colSpan = 1;
                    th_group.innerHTML = col_data[idx]["GROUP_NAME"];
                    group_col_th.appendChild(th_group);
                } else {
                    if (tmp_group_name == "") {
                        col_span = 1;
                        tmp_group_name = col_data[idx]["GROUP_NAME"];
                    } else if (idx == (col_data.length - 1)) {
                        th_group.colSpan = (col_span + 1);
                        th_group.innerHTML = tmp_group_name;
                        group_col_th.appendChild(th_group);
                    } else if (tmp_group_name != col_data[idx]["GROUP_NAME"]) {
                        th_group.colSpan = col_span;
                        th_group.innerHTML = tmp_group_name;
                        group_col_th.appendChild(th_group);

                        col_span = 1;
                        tmp_group_name = col_data[idx]["GROUP_NAME"];
                    } else {
                        col_span += 1;
                    }
                }
                col_th.appendChild(th_col);
            }
            header.appendChild(group_col_th);
            header.appendChild(col_th);
        }
        return header;
    };

    // Create Table Body Element / 테이블 바디 생성
    Plugin.prototype.createBody = function() {
        //check options => [fixedHeader, fixedColumn, fixedCount, controllerBar]
    };

    // Create ControllerBar Element / 제어창 생성
    Plugin.prototype.createControllerBar = function() {
        var controll_bar = document.createElement("DIV");
        controll_bar.className = "controll-bar";

        var list = document.createElement("UL");
        list.className = "controll-bar-list";

        for (var item_index in this.options.controllerBarItem) {
            var item = this.options.controllerBarItem[item_index];
            var li = document.createElement("LI");
            var span = document.createElement("SPAN");

            li.className = "controll-bar-list-item";
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