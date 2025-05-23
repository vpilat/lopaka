<script lang="ts" setup>
import {nextTick, onMounted, onUnmounted, ref, shallowRef, toRefs, watch} from 'vue';
import {VAceEditor} from 'vue3-ace-editor';
import {useSession} from '../../core/session';
import {debounce} from '../../utils';
import {aceMode, aceTheme} from './ace/ace-config';
const aceOptions = {
    fontSize: 12,
    showPrintMargin: false,
    showGutter: true,
    highlightActiveLine: true,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    tabSize: 4,
    useSoftTabs: true,
    wrap: true,
};

const props = defineProps<{
    readonly: boolean;
}>();

const session = useSession();
const {updates} = toRefs(session.virtualScreen.state);
const {layers} = toRefs(session.state);
const {selectionUpdates} = toRefs(session.editor.state);
const content = shallowRef('');
const aceRef = shallowRef(null);
const hovered = ref(false);

watch(
    [updates, layers],
    debounce(() => onUpdate(), 500)
);

watch(
    selectionUpdates,
    () => {
        selectRow();
    },
    {deep: true}
);
function selectRow() {
    const selectedLayers = layers.value.filter((l) => l.selected);
    if (selectedLayers.length == 1) {
        const layer = selectedLayers[0];
        const row = layersMap[layer.uid]?.line;
        if (row) {
            const {column} = aceRef.value?._editor?.getCursorPosition() ?? {column: 0};
            aceRef.value._editor.gotoLine(row + 1, column, true);
        }
    }
}
function onUpdate() {
    const sourceCode = session.generateCode();
    content.value = sourceCode.code ?? '';
    layersMap = sourceCode.map;
    nextTick(() => {
        selectRow();
    });
}
onMounted(() => {
    onUpdate();
    const editor = aceRef.value._editor;
    editor.renderer.setShowGutter(false);
});
let layersMap = {};

function onChange() {
    const {row, column} = aceRef.value._editor.getCursorPosition();
    const uid = Object.keys(layersMap).find((key) => layersMap[key].line === row);
    if (uid) {
        const layer = session.state.layers.find((l) => l.uid === uid);
        session.state.layers.forEach((l) => (l.selected = false));
        session.virtualScreen.redraw();
        layer.selected = true;
        session.editor.selectionUpdate();
    }
}

const debouncedChange = debounce(() => onChange(), 500);

function onPaste(e: ClipboardEvent) {
    const text = e.clipboardData?.getData('text/plain');
    if (text) {
        session.importCode(text, true);
    }
}

onMounted(() => {
    document.addEventListener('paste', onPaste);
});

onUnmounted(() => {
    document.removeEventListener('paste', onPaste);
});
</script>
<template>
    <div
        class="fui-code rounded-r-lg rounded-b-lg"
        :class="{'rounded-lg': readonly}"
        style="position: relative"
        @mouseenter.self="hovered = true"
        @mouseleave.self="hovered = false"
    >
        <VAceEditor
            ref="aceRef"
            v-model:value="content"
            :lang="aceMode"
            :theme="aceTheme"
            style="height: 100%; width: 100%; border-radius: 8px"
            :options="aceOptions"
            :readonly="true"
            @click="onChange"
            @keyup.up="debouncedChange"
            @keyup.down="debouncedChange"
        ></VAceEditor>
    </div>
</template>
<style lang="css" scoped>
.fui-code {
    background: var(--primary-color);
    border: 2px solid var(--border-dark-color);

    border-top: 0;
    margin: 0 0 8px 0;
    padding: 8px;
    height: 350px;
    color: var(--secondary-color);
    text-transform: none;
    overflow: auto;
    white-space: pre;
}

.fui-code:focus {
    outline: none;
}

.fui-code pre {
    margin: 0;
}

.ace_cursor {
    opacity: 0 !important;
}
</style>
