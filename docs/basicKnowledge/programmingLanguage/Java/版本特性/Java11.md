### HTTP Client 升级

### 增强 Java 启动器

```bash
   java HelloWorld.java
```

### Java Flight Recorder（JFR）

> 一个诊断工具，用于收集详细的低级别的运行时信息，以帮助开发者深入地分析和诊断Java应用的性能问题

* jvm启动后录制

  ```bash
    -XX:StartFlightRecording=duration=60s,filename=myrecording.jfr
  ```
* 运行时收集

  ```bash
  jcmd <pid> JFR.start
  jcmd <pid> JFR.dump filename=recording.jfr
  jcmd <pid> JFR.stop
  ```
