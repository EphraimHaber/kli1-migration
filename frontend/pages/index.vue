<script setup lang="ts">
useCategoriesService()
    .allCategories()
    .then((data) => {
        console.log(data);
    });
</script>

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
            <h1>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Obcaecati similique vero eaque enim dolore,
                non tenetur fuga deleniti modi quisquam eos soluta cumque aspernatur eum aliquid ut, temporibus dolores
                perferendis?
            </h1>
        </div>
    </div>
</template>

<style scoped lang="scss">
$lolcolor: blue;
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
    border: 1px solid $lolcolor;
    font-family: sans-serif;
    font-size: 46px;
    font-weight: 700;
    line-height: 70px;
    text-align: left;
}
</style>
