JSF-3(仮)

# プロジェクトの作成とビルド

プロジェクトは個々のSPA(Single Page Action)を作成する際のひとまとまりのことを指します。  

## # プロジェクトの作成


まずはnpmモジュールとしてJSF-3をインストールしたディレクトリ内に``index.js``ファイルを設置して、  
下記コードを記述します。

```
require("jsf3");
```

あとは同ディレクトリ内でプロジェクトの作成用に下記コマンドを実行するだけです。

```
node . create _project01
```

_project01をプロジェクト名としてディレクトリが作成され、指定されたテンプレートのソースが全てエクスポートされます。  
(上記の場合は指定なしなので、デフォルトのテンプレートが自動的に適用されます。)。  

テンプレートを指定するには下記のようにコマンド末尾に適用するテンプレート名を指定します。

```
node . create _project02 pc
```

プロジェクト内のディレクトリとファイルの攻勢については[こちらを参照してください。](directory_project.md)

なお、プロジェクトが作成された場合は同時にビルドも実行されます。 
ビルドについては下記項目にて解説しています。

---

## # ビルドの実行

プロジェクト内のソースを動作確認可能な状態にするには、ビルドを実行する必要があります。

ここでのビルドは実行形式ファイル(exe等)を作成するのではなく、  
プロジェクト内ソースを一度ブラウザで閲覧できる状態にすることを指します。

プロジェクトのビルドの実行方法には2通りあります。  
一つはbuildコマンドを使って指定したプロジェクトをビルドする方法。

```
node . build project01
```

コマンドのパスは上記プロジェクト作成時と同じパス内で実行します。  

もう一つの方法はプロジェクト内部にてビルド実行する方法です。  
こちらはプロジェクト内まで異動してから、``node .``を実行尾するだけです。

```
cd project01
node .
```

ビルド後はプロジェクト内の``_build``ディレクトリが作成され  
そこにファイル・ディレクトリ一式が生成されます。  
そのうちのHTMLファイルをブラウザで閲覧してください。

動作ができていればビルドが正常に完了しています。

ビルド実行後のディレクトリ構成については[こちらで解説しています。](directory_build.md)
