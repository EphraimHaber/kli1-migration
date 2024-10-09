<script setup lang="ts"></script>

<template>
    <div class="home-top__body">
        <div class="home-top__txt">
            <div class="home-top__caption">
                {{ $t('mainPage.homeCaption') }}
            </div>
            <div class="home-top__title">
                {{ $t('mainPage.homeTitle') }}
            </div>
        </div>
        <div class="home-top__img">
            <!--<HomeMan/>-->
        </div>
    </div>
</template>

<style scoped>
.home-top__body {
    align-items: center;
    margin-bottom: 35px;
}
.home-top__txt {
    font-size: 18px;
    line-height: 24px;
    max-width: 500px;
}
.home-top__title {
    border: 1px solid red;
    font-family: sans-serif;
    font-size: 46px;
    font-weight: 700;
    line-height: 70px;
    text-align: left;
}
</style>
