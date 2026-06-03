let application_success_mail_temp = function (data) {


    return `<section class="mail_temp" style="background-color: rgb(249, 249, 249);">

        <!-- // mail container  -->
        <div class="container"
            style="width: 100%; margin-right: auto; margin-left: auto; padding: 20px 5px; font-size: 16px; max-width: 480px; font-family: sans-serif; font-weight: normal; line-height: 1.4;">

            <!-- // pre header -->
            <div class="footer_top d-flex c3 fssm"
                style="color: #333; font-size: .8rem; display: -webkit-box; display: -ms-flexbox; display: flex; margin: 5px 0;">

                <!-- // left -->
                <div class="left">
                    <a href="#" style="color: inherit; text-decoration: none; display: -webkit-inline-box; display: -ms-inline-flexbox; display: inline-flex; -webkit-box-pack: center; -ms-flex-pack: center; justify-content: center; align-items: center;">

                        <!-- // logo -->
                        <span class="__logo__">

                            <img src="https://lagosscholarship.org/static/lag-assets/lagos-scholarship-logo.png" alt="LSSB logo" style="height: 30px;">

                        </span>
                        <!-- // logo // -->

                        <span style="font-weight: bold; font-size: 18px; margin-left: 10px;">Lagos State Scholarship Board</span>

                    </a>
                </div>
                <!-- // left // -->


            </div>
            <!-- // pre header // -->

            <!-- // mail card -->
            <section class="mail_card" style="background-color: #fff;">


                <!-- // mail card header -->
                <header class="bg1 py20 text_center bb_c2"
                    style="color: #fff; background-color: rgb(27, 27, 32); border-bottom: 5px solid #af8540; padding-top: 20px; padding-bottom: 20px; text-align: center;">

                    <figure>

                        <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="50.000000pt" height="50.000000pt"
                            viewBox="0 0 70.000000 70.000000" preserveAspectRatio="xMidYMid meet">

                            <g transform="translate(0.000000,70.000000) scale(0.100000,-0.100000)" fill="#fff"
                                stroke="none">
                                <path d="M322 628 c-7 -7 -12 -22 -12 -34 0 -15 -8 -24 -25 -28 -35 -9 -96
-65 -111 -103 -9 -19 -14 -70 -14 -125 0 -76 -4 -98 -20 -123 -41 -62 -15 -95
78 -95 34 0 62 -4 62 -10 0 -19 44 -50 71 -50 18 0 36 10 52 30 23 27 31 30
85 30 44 0 63 5 75 18 22 24 21 40 -3 77 -15 22 -20 47 -20 98 0 38 -4 67 -10
67 -6 0 -10 -30 -10 -71 0 -54 5 -80 20 -104 19 -30 19 -34 5 -49 -24 -24
-366 -24 -390 0 -15 15 -14 18 2 43 14 20 19 53 23 137 5 102 7 113 33 147 36
48 79 69 138 69 61 0 69 -5 62 -47 -5 -29 -1 -39 25 -65 39 -39 74 -39 113 -1
38 38 38 74 0 112 -31 30 -59 36 -91 19 -30 -16 -70 -2 -70 24 0 26 -18 46
-40 46 -9 0 -21 -5 -28 -12z m44 -19 c10 -17 -13 -36 -27 -22 -12 12 -4 33 11
33 5 0 12 -5 16 -11z m181 -86 c20 -29 5 -69 -29 -82 -70 -26 -114 72 -49 105
30 15 59 7 78 -23z m-166 -423 c-13 -11 -27 -20 -31 -20 -4 0 -18 9 -31 20
l-24 19 55 0 55 0 -24 -19z" />
                                <path d="M476 522 c-9 -15 6 -52 20 -52 9 0 14 11 14 30 0 29 -21 42 -34 22z" />
                                <path d="M279 505 c-30 -16 -62 -61 -54 -75 3 -5 23 8 44 30 26 27 47 40 64
40 15 0 27 5 27 10 0 15 -51 11 -81 -5z" />
                                <path d="M215 390 c-3 -5 -1 -10 4 -10 6 0 11 5 11 10 0 6 -2 10 -4 10 -3 0
-8 -4 -11 -10z" />
                            </g>
                        </svg>


                    </figure>

                    <h2 style="font-size: 1.3rem; margin-top: 0; color: rgb(229, 226, 218);"> ${data.subject} </h2>

                </header>
                <!-- // mail card header // -->

                <!-- // mail card body -->
                <div class="mail_card_body px20" style="padding-left: 20px; padding-right: 20px; color: #585d6f;">

                    <p class="mbp" style="color: #333;"> Dear, ${data.fullname} </p>

                    <p style="color: #787878;"> Your Application has been successfully submitted </strong> </p>

                    <p style="color: #787878;"> You'll receive a notification on the status of your application soon. </p>


                </div>
                <!-- // mail card body // -->


            </section>
            <!-- // mail card // -->

            <!-- // footer top -->
            <div class="footer_top d-flex c1"
                style="color: #333; display: -webkit-box; display: -ms-flexbox; display: flex; margin: 10px 0;">

                <!-- // left -->
                <div class="left">

                    <a href="https://lagosscholarship.org/" class="lk"
                        style="color: inherit; text-decoration: none; font-size: .95rem; display: inline-block; margin: 0 5px;">Visit Site</a>

                    <span>|</span>

                    <a href="https://portal.lagosscholarship.org/" class="lk"
                        style="color: inherit; text-decoration: none; font-size: .95rem; display: inline-block; margin: 0 5px;">Visit Portal
                    </a>
                </div>
                <!-- // left // -->

                <!-- // right -->
                <div class="right" style="margin-left: auto;">

                    <!-- // social -->
                    <a href="#" class="social_ico"
                        style="color: inherit; text-decoration: none; width: 25px; margin: 0 2px;">
                        <svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100.000000 100.000000"
                            preserveaspectratio="xMidYMid meet"
                            style="fill: currentColor; max-width: 100%; height: 20px; color: inherit;">

                            <g transform="translate(0.000000,100.000000) scale(0.100000,-0.100000)" stroke="none">
                                <path d="M514 879 c-28 -11 -59 -28 -69 -39 -27 -30 -44 -90 -45 -161 l0 -66
-42 1 -43 1 0 -75 0 -75 42 1 43 1 2 -216 3 -216 85 0 85 0 3 216 2 216 54 -5
c29 -2 56 0 60 6 3 5 9 42 12 82 l7 73 -66 -5 -67 -4 0 58 c0 68 16 82 86 76
l44 -3 0 77 0 78 -72 -1 c-47 0 -91 -7 -124 -20z" />
                            </g>
                        </svg>

                    </a>
                    <!-- // social // -->

                    <!-- // social -->
                    <a href="#" class="social_ico"
                        style="color: inherit; text-decoration: none; width: 25px; margin: 0 2px;">
                        <svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100.000000 100.000000"
                            preserveaspectratio="xMidYMid meet"
                            style="fill: currentColor; max-width: 100%; height: 20px; color: inherit;">

                            <g transform="translate(0.000000,100.000000) scale(0.100000,-0.100000)" stroke="none">
                                <path d="M607 805 c-72 -25 -117 -88 -117 -164 0 -48 -9 -50 -99 -26 -80 21
-150 58 -213 115 l-56 50 -12 -36 c-17 -52 -5 -118 31 -158 38 -44 37 -49 -6
-32 -33 14 -35 14 -35 -5 0 -52 75 -149 116 -149 8 0 12 -5 8 -11 -4 -6 -19
-9 -35 -5 -29 6 -29 5 -15 -22 25 -48 85 -92 125 -92 78 0 -71 -71 -163 -78
l-69 -5 46 -24 c137 -69 319 -68 459 3 147 75 268 263 268 418 0 46 4 54 48
100 29 30 39 46 27 42 -11 -4 -33 -10 -50 -13 l-30 -6 21 19 c25 22 63 79 49
73 -100 -42 -105 -43 -124 -24 -22 19 -86 44 -116 44 -11 0 -37 -6 -58 -14z" />
                            </g>
                        </svg>

                    </a>
                    <!-- // social // -->

                    <!-- // social -->
                    <a href="#" class="social_ico"
                        style="color: inherit; text-decoration: none; width: 25px; margin: 0 2px;">
                        <svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100.000000 100.000000"
                            preserveaspectratio="xMidYMid meet"
                            style="fill: currentColor; max-width: 100%; height: 20px; color: inherit;">

                            <g transform="translate(0.000000,100.000000) scale(0.100000,-0.100000)" stroke="none">
                                <path d="M239 905 c-3 -3 9 -48 28 -101 24 -70 33 -113 33 -160 0 -62 1 -64
25 -64 24 0 25 2 25 63 0 45 9 88 34 159 19 53 32 99 28 102 -3 3 -14 6 -24 6
-20 0 -31 -20 -49 -90 l-12 -45 -21 65 c-16 49 -26 66 -41 68 -12 2 -23 0 -26
-3z" />
                                <path d="M436 798 c-11 -16 -16 -46 -16 -101 0 -69 3 -81 25 -102 29 -30 64
-32 96 -6 22 18 24 27 24 111 0 79 -3 94 -19 106 -31 22 -92 18 -110 -8z m82
-94 c2 -53 -1 -74 -12 -83 -26 -22 -36 -2 -36 73 0 76 4 89 30 84 11 -3 16
-20 18 -74z" />
                                <path d="M610 701 c0 -132 6 -144 61 -116 16 9 29 11 29 5 0 -5 11 -10 25 -10
l26 0 -3 118 c-3 113 -4 117 -25 120 -22 3 -23 1 -23 -91 0 -78 -3 -96 -16
-101 -29 -11 -34 4 -34 100 0 87 -1 94 -20 94 -19 0 -20 -7 -20 -119z" />
                                <path d="M149 479 c-62 -36 -81 -85 -81 -199 0 -121 19 -164 92 -204 l48 -26
291 0 c276 0 294 1 336 21 79 37 110 107 103 230 -5 86 -27 140 -72 172 -30
22 -38 22 -356 24 -316 3 -326 2 -361 -18z m191 -54 c0 -20 -5 -25 -25 -25
l-25 0 0 -125 0 -125 -25 0 -25 0 0 125 0 125 -25 0 c-20 0 -25 5 -25 25 0 24
2 25 75 25 73 0 75 -1 75 -25z m220 -20 c0 -43 1 -44 28 -39 45 9 53 -11 50
-117 l-3 -94 -57 -2 -58 -1 0 149 c0 142 1 149 20 149 17 0 20 -7 20 -45z
m-160 -114 c0 -90 6 -112 26 -104 11 4 14 27 14 94 0 88 0 89 25 89 l25 0 0
-110 0 -110 -25 0 c-14 0 -25 5 -25 11 0 6 -9 4 -22 -5 -15 -11 -26 -12 -40
-5 -16 8 -18 23 -18 114 0 98 1 105 20 105 18 0 20 -7 20 -79z m380 63 c8 -8
14 -34 14 -57 l1 -42 -43 -3 c-42 -3 -43 -4 -40 -34 4 -37 27 -49 35 -19 3 14
13 21 29 21 31 0 31 -24 -1 -55 -29 -30 -58 -32 -85 -5 -27 27 -29 163 -3 192
20 22 76 24 93 2z" />
                                <path d="M572 331 c-9 -5 -12 -30 -10 -77 2 -56 6 -69 21 -72 15 -3 17 6 17
72 0 76 -6 91 -28 77z" />
                                <path d="M722 328 c-18 -18 -14 -38 8 -38 13 0 20 7 20 19 0 25 -13 34 -28 19z" />
                            </g>
                        </svg>


                    </a>
                    <!-- // social // -->

                    <!-- // social -->
                    <a href="#" class="social_ico"
                        style="color: inherit; text-decoration: none; width: 25px; margin: 0 2px;">

                        <svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100.000000 100.000000"
                            preserveaspectratio="xMidYMid meet"
                            style="fill: currentColor; max-width: 100%; height: 20px; color: inherit;">

                            <g transform="translate(0.000000,100.000000) scale(0.100000,-0.100000)" stroke="none">
                                <path d="M261 910 c-57 -12 -124 -52 -152 -91 -42 -59 -49 -109 -49 -339 0
-243 9 -295 62 -356 67 -76 138 -94 379 -94 229 0 295 15 364 84 66 66 70 87
70 361 0 268 -4 292 -64 358 -67 74 -95 81 -346 84 -121 1 -240 -2 -264 -7z
m526 -106 c15 -12 37 -36 48 -55 19 -31 20 -52 20 -274 0 -233 -1 -241 -23
-277 -13 -21 -40 -45 -66 -57 -39 -19 -60 -21 -267 -21 -213 0 -227 1 -269 22
-33 17 -51 35 -67 68 -22 42 -23 56 -23 262 0 228 6 264 48 312 38 42 64 46
324 43 233 -2 248 -3 275 -23z" />
                                <path d="M697 742 c-22 -24 -21 -45 1 -65 37 -34 82 -15 82 33 0 49 -51 68
-83 32z" />
                                <path d="M405 684 c-58 -32 -105 -86 -121 -142 -63 -215 192 -379 360 -231
112 99 100 273 -26 356 -52 35 -164 44 -213 17z m170 -84 c63 -39 84 -134 45
-198 -27 -45 -96 -75 -147 -66 -50 9 -108 67 -117 117 -9 51 21 120 66 147 43
26 111 26 153 0z" />
                            </g>
                        </svg>

                    </a>
                    <!-- // social // -->

                </div>
                <!-- // right // -->

            </div>
            <!-- // footer top // -->

            <!-- // footer  -->
            <div class="footer_ d-flex c3 fssm"
                style="color: #333; font-size: .8rem; display: -webkit-box; display: -ms-flexbox; display: flex; margin: 5px 0;">

                <!-- // left -->
                <div class="left">

                    <a href="#" style="color: inherit; text-decoration: none;">&copy; 2025 Lagos State Scholarship Board | All rights
                        reserved </a>
                </div>
                <!-- // left // -->

                <!-- // left -->
                <div class="right" style="margin-left: auto; display:none;">

                    <a href="#" class="lk2" style="color: inherit; text-decoration: none; font-size: .8rem;">About
                        Us</a>
                    <span>|</span>
                    <a href="#" class="lk2" style="color: inherit; text-decoration: none; font-size: .8rem;">Contact
                        Us</a>
                </div>
                <!-- // left // -->


            </div>
            <!-- // footer  // -->


        </div>
        <!-- // mail container // -->

    </section>`

};


module.exports = application_success_mail_temp; 