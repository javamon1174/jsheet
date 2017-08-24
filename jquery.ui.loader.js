window.loader = {
    //loader test
    // var settings = { //global
    //     type: "outer",
    //     spin_second: "0.5s",
    //     dim_top: "56px",
    //     loader_margin: "-150px 0px 0px 0px"
    // };
    // var settings = {
    //     target: "#content > div > div.panel-footer > div:nth-child(1) > h5",
    //     type: "inner",
    //     spin_second: "0.5s",
    //     width: "10px",
    //     height: "10px",
    //     loader_margin: "0px 10px 0px 0px"
    // };
    //
    // loader.create(settings);
    //
    // setTimeout(function() {
    //     loader.remove();
    // }, 3000);

    name: "loader",

    prop: {
        target          : "body",
        type            : "inner", // or outer
        border          : "10px",
        out_color       : "#f3f3f3",
        in_color        : "gray",
        dim_color       : "rgba(0, 0, 0, 0.7)",
        width           : "80px",
        height          : "80px",
        dim_top         : "0px",
        dim_left        : "0px",
        dim_width       : "100%",
        dim_height      : "100%",
        loader_margin   : "0px",
        spin_second     : "1s",
        float           : "right"
    },

    set_prop: {},

    getName: function () {
        return this.name;
    },

    create: function (custom) {
        if ($(".loader").length !== 0)
        {
            return false;
        }

        //set custom setting value
        this.set_prop = $.extend({}, this.prop, custom);

        //set loader to document
        this.setLoader2Document();
    },

    setLoader2Document: function ()
    {
        var setting;

        switch (this.set_prop.type) {
            case "outer":
                var dim       = document.createElement("DIV");
                var loader    = document.createElement("DIV")
                var border    = this.set_prop.border + " solid " + this.set_prop.out_color;
                var borderTop = this.set_prop.border+" solid "+this.set_prop.in_color;

                // dim setting
                dim.id = "dim";
                dim.className        = "dim";
                dim.style.width      = this.set_prop.dim_width;
                dim.style.height     = this.set_prop.dim_height;
                dim.style.top        = this.set_prop.dim_top;
                dim.style.left       = this.set_prop.dim_left;
                dim.style.backgroundColor = this.set_prop.dim_color;

                // loader setting
                loader.id                       = "loader";
                loader.className                = "loader";
                loader.style.width              = this.set_prop.width;
                loader.style.height             = this.set_prop.height;
                loader.style.margin             = this.set_prop.loader_margin;
                loader.style.border             = border;
                loader.style.borderTop          = borderTop;
                loader.style.WebkitAnimation    = "spin "+this.set_prop.spin_second+" linear infinite";
                loader.style.animation          = "spin "+this.set_prop.spin_second+" linear infinite";

                dim.appendChild(loader);

                $(this.set_prop.target).append(dim);

                setting = true;
                break;

            case "inner":
                var loader    = document.createElement("DIV")
                var border    = this.set_prop.border + " solid " + this.set_prop.out_color;
                var borderTop = this.set_prop.border+" solid "+this.set_prop.in_color;

                loader.id                    = "loader";
                loader.className             = "loader inner";
                loader.style.width           = this.set_prop.width;
                loader.style.height          = this.set_prop.height;
                loader.style.margin          = this.set_prop.loader_margin;
                loader.style.border          = border;
                loader.style.borderTop       = borderTop;
                loader.style.WebkitAnimation = "spin "+this.set_prop.spin_second+" linear infinite";
                loader.style.animation       = "spin "+this.set_prop.spin_second+" linear infinite";
                loader.style.float           = this.set_prop.float;

                $(this.set_prop.target).append(loader);

                setting = true;
                break;
        }
        return setting;
    },

    remove: function () {
        $(".dim").remove();
        $("."+this.name).remove();
    }
}

