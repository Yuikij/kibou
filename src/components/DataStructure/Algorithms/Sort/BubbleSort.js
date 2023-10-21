import {Button} from "antd";
import ArrayComponent from "../../Array";
import React, {useRef} from "react";
import {ThreadSleep} from "../../../Tools/Thread";

export default function BubbleSort({arr}) {
    const arrayRef = useRef(null);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function bubbleSort(arr) {
        let n = arr.length;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    // 交换元素
                    let temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }

    function nextStep() {

    }

    async function doSort() {
        let n = arr.length;
        arrayRef.current.init([...arr])
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    console.log("before");
                    await ThreadSleep(500);
                    // 交换元素
                    let temp = arr[j];
                    console.log("arr:" + arr);
                    await arrayRef.current.addIndex(arr[j + 1],j)

                    arr[j] = arr[j + 1];
                    await arrayRef.current.addIndex(temp,j + 1)
                    arr[j + 1] = temp;
                    console.log( arrayRef.current.getArr())
                    console.log( arr)
                    console.log("end")
                }
            }
        }
    }

    return (
        <div>
            <Button onClick={nextStep}>nextStep</Button>
            <Button onClick={doSort}>doSort</Button>
            <ArrayComponent arrayRef={arrayRef}/>
        </div>
    );
}