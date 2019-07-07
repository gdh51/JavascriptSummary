    class Father {
      constructor(size, fea) {
        this.size = size;
        this.fea = fea;
      }

      static goo() {
        return 'static prop';
      }

      getSize() {
        return this.size;
      }
    }

    class Son extends Father {
      constructor(a, b, name) {
        super(a, b);
        this.name = name;
      }
    }

    function es5Father(size, fea) {
      this.size = size;
      this.fea = fea;
    }

    es5Father.goo = function () {
      return 'es5Static prop';
    }

    es5Father.prototype.getSize = function () {
      return this.size;
    }

    // function createObject(obj){
    // function Middle(){}//中间对象构造函数

    // Middle.prototype = obj;

    // return new Middle();
    // }


    // function Parent(age, hobby, private) {
    //   this.age = age;
    //   this.hobby = hobby;
    //   this.private = private;
    // }

    // Parent.prototype.say = function () {
    //   return this.age;
    // };

    // ///////////差异////////////
    // function Child(age, hobby, private, name){
    // Parent.call(this, age, hobby, private);

    // this.name = name;
    // }

    // Child.prototype = createObject(Parent.prototype);
    // Child.prototype.constructor = Child;
    // ///////////差异////////////
    class Parent {
      constructor(age, hobby, privateprop){
        this.age = age;
        this.hobby = hobby;
        this.private = privateprop;
      }

      say(){
        return this.age;
      }
    }

    class Child extends Parent {
      constructor(age, hobby, privateprop, name){
        super(age, hobby, privateprop);
        this.name = name;
      }
    }
    console.log(new Child(1, 2, 3, 4));