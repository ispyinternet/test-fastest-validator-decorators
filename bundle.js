'use strict';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var dist = {};

/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var Reflect$1;
(function (Reflect) {
    // Metadata Proposal
    // https://rbuckton.github.io/reflect-metadata/
    (function (factory) {
        var root = typeof commonjsGlobal === "object" ? commonjsGlobal :
            typeof self === "object" ? self :
                typeof this === "object" ? this :
                    Function("return this;")();
        var exporter = makeExporter(Reflect);
        if (typeof root.Reflect === "undefined") {
            root.Reflect = Reflect;
        }
        else {
            exporter = makeExporter(root.Reflect, exporter);
        }
        factory(exporter);
        function makeExporter(target, previous) {
            return function (key, value) {
                if (typeof target[key] !== "function") {
                    Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
                }
                if (previous)
                    previous(key, value);
            };
        }
    })(function (exporter) {
        var hasOwn = Object.prototype.hasOwnProperty;
        // feature test for Symbol support
        var supportsSymbol = typeof Symbol === "function";
        var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
        var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
        var supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
        var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
        var downLevel = !supportsCreate && !supportsProto;
        var HashMap = {
            // create an object in dictionary mode (a.k.a. "slow" mode in v8)
            create: supportsCreate
                ? function () { return MakeDictionary(Object.create(null)); }
                : supportsProto
                    ? function () { return MakeDictionary({ __proto__: null }); }
                    : function () { return MakeDictionary({}); },
            has: downLevel
                ? function (map, key) { return hasOwn.call(map, key); }
                : function (map, key) { return key in map; },
            get: downLevel
                ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
                : function (map, key) { return map[key]; },
        };
        // Load global or shim versions of Map, Set, and WeakMap
        var functionPrototype = Object.getPrototypeOf(Function);
        var usePolyfill = typeof process === "object" && process.env && process.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
        var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
        var _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
        var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
        // [[Metadata]] internal slot
        // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
        var Metadata = new _WeakMap();
        /**
         * Applies a set of decorators to a property of a target object.
         * @param decorators An array of decorators.
         * @param target The target object.
         * @param propertyKey (Optional) The property key to decorate.
         * @param attributes (Optional) The property descriptor for the target key.
         * @remarks Decorators are applied in reverse order.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     Example = Reflect.decorate(decoratorsArray, Example);
         *
         *     // property (on constructor)
         *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
         *
         *     // property (on prototype)
         *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
         *
         *     // method (on constructor)
         *     Object.defineProperty(Example, "staticMethod",
         *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
         *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
         *
         *     // method (on prototype)
         *     Object.defineProperty(Example.prototype, "method",
         *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
         *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
         *
         */
        function decorate(decorators, target, propertyKey, attributes) {
            if (!IsUndefined(propertyKey)) {
                if (!IsArray(decorators))
                    throw new TypeError();
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
                    throw new TypeError();
                if (IsNull(attributes))
                    attributes = undefined;
                propertyKey = ToPropertyKey(propertyKey);
                return DecorateProperty(decorators, target, propertyKey, attributes);
            }
            else {
                if (!IsArray(decorators))
                    throw new TypeError();
                if (!IsConstructor(target))
                    throw new TypeError();
                return DecorateConstructor(decorators, target);
            }
        }
        exporter("decorate", decorate);
        // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
        // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
        /**
         * A default metadata decorator factory that can be used on a class, class member, or parameter.
         * @param metadataKey The key for the metadata entry.
         * @param metadataValue The value for the metadata entry.
         * @returns A decorator function.
         * @remarks
         * If `metadataKey` is already defined for the target and target key, the
         * metadataValue for that key will be overwritten.
         * @example
         *
         *     // constructor
         *     @Reflect.metadata(key, value)
         *     class Example {
         *     }
         *
         *     // property (on constructor, TypeScript only)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         static staticProperty;
         *     }
         *
         *     // property (on prototype, TypeScript only)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         property;
         *     }
         *
         *     // method (on constructor)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         static staticMethod() { }
         *     }
         *
         *     // method (on prototype)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         method() { }
         *     }
         *
         */
        function metadata(metadataKey, metadataValue) {
            function decorator(target, propertyKey) {
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
                    throw new TypeError();
                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
            }
            return decorator;
        }
        exporter("metadata", metadata);
        /**
         * Define a unique metadata entry on the target.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param metadataValue A value that contains attached metadata.
         * @param target The target object on which to define metadata.
         * @param propertyKey (Optional) The property key for the target.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     Reflect.defineMetadata("custom:annotation", options, Example);
         *
         *     // property (on constructor)
         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
         *
         *     // property (on prototype)
         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
         *
         *     // method (on constructor)
         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
         *
         *     // method (on prototype)
         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
         *
         *     // decorator factory as metadata-producing annotation.
         *     function MyAnnotation(options): Decorator {
         *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
         *     }
         *
         */
        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        exporter("defineMetadata", defineMetadata);
        /**
         * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.hasMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function hasMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasMetadata", hasMetadata);
        /**
         * Gets a value indicating whether the target object has the provided metadata key defined.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function hasOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasOwnMetadata", hasOwnMetadata);
        /**
         * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function getMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetMetadata(metadataKey, target, propertyKey);
        }
        exporter("getMetadata", getMetadata);
        /**
         * Gets the metadata value for the provided metadata key on the target object.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getOwnMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function getOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("getOwnMetadata", getOwnMetadata);
        /**
         * Gets the metadata keys defined on the target object or its prototype chain.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns An array of unique metadata keys.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getMetadataKeys(Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getMetadataKeys(Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getMetadataKeys(Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getMetadataKeys(Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getMetadataKeys(Example.prototype, "method");
         *
         */
        function getMetadataKeys(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryMetadataKeys(target, propertyKey);
        }
        exporter("getMetadataKeys", getMetadataKeys);
        /**
         * Gets the unique metadata keys defined on the target object.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns An array of unique metadata keys.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getOwnMetadataKeys(Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
         *
         */
        function getOwnMetadataKeys(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryOwnMetadataKeys(target, propertyKey);
        }
        exporter("getOwnMetadataKeys", getOwnMetadataKeys);
        /**
         * Deletes the metadata entry from the target object with the provided key.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata entry was found and deleted; otherwise, false.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.deleteMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function deleteMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            var metadataMap = GetOrCreateMetadataMap(target, propertyKey, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return false;
            if (!metadataMap.delete(metadataKey))
                return false;
            if (metadataMap.size > 0)
                return true;
            var targetMetadata = Metadata.get(target);
            targetMetadata.delete(propertyKey);
            if (targetMetadata.size > 0)
                return true;
            Metadata.delete(target);
            return true;
        }
        exporter("deleteMetadata", deleteMetadata);
        function DecorateConstructor(decorators, target) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsConstructor(decorated))
                        throw new TypeError();
                    target = decorated;
                }
            }
            return target;
        }
        function DecorateProperty(decorators, target, propertyKey, descriptor) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target, propertyKey, descriptor);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsObject(decorated))
                        throw new TypeError();
                    descriptor = decorated;
                }
            }
            return descriptor;
        }
        function GetOrCreateMetadataMap(O, P, Create) {
            var targetMetadata = Metadata.get(O);
            if (IsUndefined(targetMetadata)) {
                if (!Create)
                    return undefined;
                targetMetadata = new _Map();
                Metadata.set(O, targetMetadata);
            }
            var metadataMap = targetMetadata.get(P);
            if (IsUndefined(metadataMap)) {
                if (!Create)
                    return undefined;
                metadataMap = new _Map();
                targetMetadata.set(P, metadataMap);
            }
            return metadataMap;
        }
        // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
        function OrdinaryHasMetadata(MetadataKey, O, P) {
            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn)
                return true;
            var parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent))
                return OrdinaryHasMetadata(MetadataKey, parent, P);
            return false;
        }
        // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
        function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return false;
            return ToBoolean(metadataMap.has(MetadataKey));
        }
        // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
        function OrdinaryGetMetadata(MetadataKey, O, P) {
            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn)
                return OrdinaryGetOwnMetadata(MetadataKey, O, P);
            var parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent))
                return OrdinaryGetMetadata(MetadataKey, parent, P);
            return undefined;
        }
        // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
        function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return undefined;
            return metadataMap.get(MetadataKey);
        }
        // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
        function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
            metadataMap.set(MetadataKey, MetadataValue);
        }
        // 3.1.6.1 OrdinaryMetadataKeys(O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
        function OrdinaryMetadataKeys(O, P) {
            var ownKeys = OrdinaryOwnMetadataKeys(O, P);
            var parent = OrdinaryGetPrototypeOf(O);
            if (parent === null)
                return ownKeys;
            var parentKeys = OrdinaryMetadataKeys(parent, P);
            if (parentKeys.length <= 0)
                return ownKeys;
            if (ownKeys.length <= 0)
                return parentKeys;
            var set = new _Set();
            var keys = [];
            for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
                var key = ownKeys_1[_i];
                var hasKey = set.has(key);
                if (!hasKey) {
                    set.add(key);
                    keys.push(key);
                }
            }
            for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
                var key = parentKeys_1[_a];
                var hasKey = set.has(key);
                if (!hasKey) {
                    set.add(key);
                    keys.push(key);
                }
            }
            return keys;
        }
        // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
        function OrdinaryOwnMetadataKeys(O, P) {
            var keys = [];
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return keys;
            var keysObj = metadataMap.keys();
            var iterator = GetIterator(keysObj);
            var k = 0;
            while (true) {
                var next = IteratorStep(iterator);
                if (!next) {
                    keys.length = k;
                    return keys;
                }
                var nextValue = IteratorValue(next);
                try {
                    keys[k] = nextValue;
                }
                catch (e) {
                    try {
                        IteratorClose(iterator);
                    }
                    finally {
                        throw e;
                    }
                }
                k++;
            }
        }
        // 6 ECMAScript Data Typ0es and Values
        // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
        function Type(x) {
            if (x === null)
                return 1 /* Null */;
            switch (typeof x) {
                case "undefined": return 0 /* Undefined */;
                case "boolean": return 2 /* Boolean */;
                case "string": return 3 /* String */;
                case "symbol": return 4 /* Symbol */;
                case "number": return 5 /* Number */;
                case "object": return x === null ? 1 /* Null */ : 6 /* Object */;
                default: return 6 /* Object */;
            }
        }
        // 6.1.1 The Undefined Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
        function IsUndefined(x) {
            return x === undefined;
        }
        // 6.1.2 The Null Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
        function IsNull(x) {
            return x === null;
        }
        // 6.1.5 The Symbol Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
        function IsSymbol(x) {
            return typeof x === "symbol";
        }
        // 6.1.7 The Object Type
        // https://tc39.github.io/ecma262/#sec-object-type
        function IsObject(x) {
            return typeof x === "object" ? x !== null : typeof x === "function";
        }
        // 7.1 Type Conversion
        // https://tc39.github.io/ecma262/#sec-type-conversion
        // 7.1.1 ToPrimitive(input [, PreferredType])
        // https://tc39.github.io/ecma262/#sec-toprimitive
        function ToPrimitive(input, PreferredType) {
            switch (Type(input)) {
                case 0 /* Undefined */: return input;
                case 1 /* Null */: return input;
                case 2 /* Boolean */: return input;
                case 3 /* String */: return input;
                case 4 /* Symbol */: return input;
                case 5 /* Number */: return input;
            }
            var hint = PreferredType === 3 /* String */ ? "string" : PreferredType === 5 /* Number */ ? "number" : "default";
            var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
            if (exoticToPrim !== undefined) {
                var result = exoticToPrim.call(input, hint);
                if (IsObject(result))
                    throw new TypeError();
                return result;
            }
            return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
        }
        // 7.1.1.1 OrdinaryToPrimitive(O, hint)
        // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
        function OrdinaryToPrimitive(O, hint) {
            if (hint === "string") {
                var toString_1 = O.toString;
                if (IsCallable(toString_1)) {
                    var result = toString_1.call(O);
                    if (!IsObject(result))
                        return result;
                }
                var valueOf = O.valueOf;
                if (IsCallable(valueOf)) {
                    var result = valueOf.call(O);
                    if (!IsObject(result))
                        return result;
                }
            }
            else {
                var valueOf = O.valueOf;
                if (IsCallable(valueOf)) {
                    var result = valueOf.call(O);
                    if (!IsObject(result))
                        return result;
                }
                var toString_2 = O.toString;
                if (IsCallable(toString_2)) {
                    var result = toString_2.call(O);
                    if (!IsObject(result))
                        return result;
                }
            }
            throw new TypeError();
        }
        // 7.1.2 ToBoolean(argument)
        // https://tc39.github.io/ecma262/2016/#sec-toboolean
        function ToBoolean(argument) {
            return !!argument;
        }
        // 7.1.12 ToString(argument)
        // https://tc39.github.io/ecma262/#sec-tostring
        function ToString(argument) {
            return "" + argument;
        }
        // 7.1.14 ToPropertyKey(argument)
        // https://tc39.github.io/ecma262/#sec-topropertykey
        function ToPropertyKey(argument) {
            var key = ToPrimitive(argument, 3 /* String */);
            if (IsSymbol(key))
                return key;
            return ToString(key);
        }
        // 7.2 Testing and Comparison Operations
        // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
        // 7.2.2 IsArray(argument)
        // https://tc39.github.io/ecma262/#sec-isarray
        function IsArray(argument) {
            return Array.isArray
                ? Array.isArray(argument)
                : argument instanceof Object
                    ? argument instanceof Array
                    : Object.prototype.toString.call(argument) === "[object Array]";
        }
        // 7.2.3 IsCallable(argument)
        // https://tc39.github.io/ecma262/#sec-iscallable
        function IsCallable(argument) {
            // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
            return typeof argument === "function";
        }
        // 7.2.4 IsConstructor(argument)
        // https://tc39.github.io/ecma262/#sec-isconstructor
        function IsConstructor(argument) {
            // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
            return typeof argument === "function";
        }
        // 7.2.7 IsPropertyKey(argument)
        // https://tc39.github.io/ecma262/#sec-ispropertykey
        function IsPropertyKey(argument) {
            switch (Type(argument)) {
                case 3 /* String */: return true;
                case 4 /* Symbol */: return true;
                default: return false;
            }
        }
        // 7.3 Operations on Objects
        // https://tc39.github.io/ecma262/#sec-operations-on-objects
        // 7.3.9 GetMethod(V, P)
        // https://tc39.github.io/ecma262/#sec-getmethod
        function GetMethod(V, P) {
            var func = V[P];
            if (func === undefined || func === null)
                return undefined;
            if (!IsCallable(func))
                throw new TypeError();
            return func;
        }
        // 7.4 Operations on Iterator Objects
        // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
        function GetIterator(obj) {
            var method = GetMethod(obj, iteratorSymbol);
            if (!IsCallable(method))
                throw new TypeError(); // from Call
            var iterator = method.call(obj);
            if (!IsObject(iterator))
                throw new TypeError();
            return iterator;
        }
        // 7.4.4 IteratorValue(iterResult)
        // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
        function IteratorValue(iterResult) {
            return iterResult.value;
        }
        // 7.4.5 IteratorStep(iterator)
        // https://tc39.github.io/ecma262/#sec-iteratorstep
        function IteratorStep(iterator) {
            var result = iterator.next();
            return result.done ? false : result;
        }
        // 7.4.6 IteratorClose(iterator, completion)
        // https://tc39.github.io/ecma262/#sec-iteratorclose
        function IteratorClose(iterator) {
            var f = iterator["return"];
            if (f)
                f.call(iterator);
        }
        // 9.1 Ordinary Object Internal Methods and Internal Slots
        // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
        // 9.1.1.1 OrdinaryGetPrototypeOf(O)
        // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
        function OrdinaryGetPrototypeOf(O) {
            var proto = Object.getPrototypeOf(O);
            if (typeof O !== "function" || O === functionPrototype)
                return proto;
            // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
            // Try to determine the superclass constructor. Compatible implementations
            // must either set __proto__ on a subclass constructor to the superclass constructor,
            // or ensure each class has a valid `constructor` property on its prototype that
            // points back to the constructor.
            // If this is not the same as Function.[[Prototype]], then this is definately inherited.
            // This is the case when in ES6 or when using __proto__ in a compatible browser.
            if (proto !== functionPrototype)
                return proto;
            // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
            var prototype = O.prototype;
            var prototypeProto = prototype && Object.getPrototypeOf(prototype);
            if (prototypeProto == null || prototypeProto === Object.prototype)
                return proto;
            // If the constructor was not a function, then we cannot determine the heritage.
            var constructor = prototypeProto.constructor;
            if (typeof constructor !== "function")
                return proto;
            // If we have some kind of self-reference, then we cannot determine the heritage.
            if (constructor === O)
                return proto;
            // we have a pretty good guess at the heritage.
            return constructor;
        }
        // naive Map shim
        function CreateMapPolyfill() {
            var cacheSentinel = {};
            var arraySentinel = [];
            var MapIterator = /** @class */ (function () {
                function MapIterator(keys, values, selector) {
                    this._index = 0;
                    this._keys = keys;
                    this._values = values;
                    this._selector = selector;
                }
                MapIterator.prototype["@@iterator"] = function () { return this; };
                MapIterator.prototype[iteratorSymbol] = function () { return this; };
                MapIterator.prototype.next = function () {
                    var index = this._index;
                    if (index >= 0 && index < this._keys.length) {
                        var result = this._selector(this._keys[index], this._values[index]);
                        if (index + 1 >= this._keys.length) {
                            this._index = -1;
                            this._keys = arraySentinel;
                            this._values = arraySentinel;
                        }
                        else {
                            this._index++;
                        }
                        return { value: result, done: false };
                    }
                    return { value: undefined, done: true };
                };
                MapIterator.prototype.throw = function (error) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    throw error;
                };
                MapIterator.prototype.return = function (value) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    return { value: value, done: true };
                };
                return MapIterator;
            }());
            return /** @class */ (function () {
                function Map() {
                    this._keys = [];
                    this._values = [];
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                }
                Object.defineProperty(Map.prototype, "size", {
                    get: function () { return this._keys.length; },
                    enumerable: true,
                    configurable: true
                });
                Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
                Map.prototype.get = function (key) {
                    var index = this._find(key, /*insert*/ false);
                    return index >= 0 ? this._values[index] : undefined;
                };
                Map.prototype.set = function (key, value) {
                    var index = this._find(key, /*insert*/ true);
                    this._values[index] = value;
                    return this;
                };
                Map.prototype.delete = function (key) {
                    var index = this._find(key, /*insert*/ false);
                    if (index >= 0) {
                        var size = this._keys.length;
                        for (var i = index + 1; i < size; i++) {
                            this._keys[i - 1] = this._keys[i];
                            this._values[i - 1] = this._values[i];
                        }
                        this._keys.length--;
                        this._values.length--;
                        if (key === this._cacheKey) {
                            this._cacheKey = cacheSentinel;
                            this._cacheIndex = -2;
                        }
                        return true;
                    }
                    return false;
                };
                Map.prototype.clear = function () {
                    this._keys.length = 0;
                    this._values.length = 0;
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                };
                Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
                Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
                Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
                Map.prototype["@@iterator"] = function () { return this.entries(); };
                Map.prototype[iteratorSymbol] = function () { return this.entries(); };
                Map.prototype._find = function (key, insert) {
                    if (this._cacheKey !== key) {
                        this._cacheIndex = this._keys.indexOf(this._cacheKey = key);
                    }
                    if (this._cacheIndex < 0 && insert) {
                        this._cacheIndex = this._keys.length;
                        this._keys.push(key);
                        this._values.push(undefined);
                    }
                    return this._cacheIndex;
                };
                return Map;
            }());
            function getKey(key, _) {
                return key;
            }
            function getValue(_, value) {
                return value;
            }
            function getEntry(key, value) {
                return [key, value];
            }
        }
        // naive Set shim
        function CreateSetPolyfill() {
            return /** @class */ (function () {
                function Set() {
                    this._map = new _Map();
                }
                Object.defineProperty(Set.prototype, "size", {
                    get: function () { return this._map.size; },
                    enumerable: true,
                    configurable: true
                });
                Set.prototype.has = function (value) { return this._map.has(value); };
                Set.prototype.add = function (value) { return this._map.set(value, value), this; };
                Set.prototype.delete = function (value) { return this._map.delete(value); };
                Set.prototype.clear = function () { this._map.clear(); };
                Set.prototype.keys = function () { return this._map.keys(); };
                Set.prototype.values = function () { return this._map.values(); };
                Set.prototype.entries = function () { return this._map.entries(); };
                Set.prototype["@@iterator"] = function () { return this.keys(); };
                Set.prototype[iteratorSymbol] = function () { return this.keys(); };
                return Set;
            }());
        }
        // naive WeakMap shim
        function CreateWeakMapPolyfill() {
            var UUID_SIZE = 16;
            var keys = HashMap.create();
            var rootKey = CreateUniqueKey();
            return /** @class */ (function () {
                function WeakMap() {
                    this._key = CreateUniqueKey();
                }
                WeakMap.prototype.has = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? HashMap.has(table, this._key) : false;
                };
                WeakMap.prototype.get = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? HashMap.get(table, this._key) : undefined;
                };
                WeakMap.prototype.set = function (target, value) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ true);
                    table[this._key] = value;
                    return this;
                };
                WeakMap.prototype.delete = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? delete table[this._key] : false;
                };
                WeakMap.prototype.clear = function () {
                    // NOTE: not a real clear, just makes the previous data unreachable
                    this._key = CreateUniqueKey();
                };
                return WeakMap;
            }());
            function CreateUniqueKey() {
                var key;
                do
                    key = "@@WeakMap@@" + CreateUUID();
                while (HashMap.has(keys, key));
                keys[key] = true;
                return key;
            }
            function GetOrCreateWeakMapTable(target, create) {
                if (!hasOwn.call(target, rootKey)) {
                    if (!create)
                        return undefined;
                    Object.defineProperty(target, rootKey, { value: HashMap.create() });
                }
                return target[rootKey];
            }
            function FillRandomBytes(buffer, size) {
                for (var i = 0; i < size; ++i)
                    buffer[i] = Math.random() * 0xff | 0;
                return buffer;
            }
            function GenRandomBytes(size) {
                if (typeof Uint8Array === "function") {
                    if (typeof crypto !== "undefined")
                        return crypto.getRandomValues(new Uint8Array(size));
                    if (typeof msCrypto !== "undefined")
                        return msCrypto.getRandomValues(new Uint8Array(size));
                    return FillRandomBytes(new Uint8Array(size), size);
                }
                return FillRandomBytes(new Array(size), size);
            }
            function CreateUUID() {
                var data = GenRandomBytes(UUID_SIZE);
                // mark as random - RFC 4122 § 4.4
                data[6] = data[6] & 0x4f | 0x40;
                data[8] = data[8] & 0xbf | 0x80;
                var result = "";
                for (var offset = 0; offset < UUID_SIZE; ++offset) {
                    var byte = data[offset];
                    if (offset === 4 || offset === 6 || offset === 8)
                        result += "-";
                    if (byte < 16)
                        result += "0";
                    result += byte.toString(16).toLowerCase();
                }
                return result;
            }
        }
        // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
        function MakeDictionary(obj) {
            obj.__ = undefined;
            delete obj.__;
            return obj;
        }
    });
})(Reflect$1 || (Reflect$1 = {}));

var fastestValidator = {exports: {}};

function isObjectHasKeys(v) {
	if (typeof v !== "object" || Array.isArray(v) || v == null) return false;
	return Object.keys(v).length > 0;
}

function deepExtend$1(destination, source, options = {}) {
	for (let property in source) {
		if (isObjectHasKeys(source[property])) {
			destination[property] = destination[property] || {};
			deepExtend$1(destination[property], source[property], options);
		} else {
			if (options.skipIfExist === true && destination[property] !== undefined) continue;
			destination[property] = source[property];
		}
	}
	return destination;
}

var deepExtend_1 = deepExtend$1;

function convertible(value) {
	if (value === undefined) return "";
	if (value === null) return "";
	if (typeof value.toString === "function") return value;
	return typeof value;
}

var replace$1 = (string, searchValue, newValue) => string.replace(searchValue, convertible(newValue));

var messages;
var hasRequiredMessages;

function requireMessages () {
	if (hasRequiredMessages) return messages;
	hasRequiredMessages = 1;

	messages = {
		required: "The '{field}' field is required.",

		string: "The '{field}' field must be a string.",
		stringEmpty: "The '{field}' field must not be empty.",
		stringMin: "The '{field}' field length must be greater than or equal to {expected} characters long.",
		stringMax: "The '{field}' field length must be less than or equal to {expected} characters long.",
		stringLength: "The '{field}' field length must be {expected} characters long.",
		stringPattern: "The '{field}' field fails to match the required pattern.",
		stringContains: "The '{field}' field must contain the '{expected}' text.",
		stringEnum: "The '{field}' field does not match any of the allowed values.",
		stringNumeric: "The '{field}' field must be a numeric string.",
		stringAlpha: "The '{field}' field must be an alphabetic string.",
		stringAlphanum: "The '{field}' field must be an alphanumeric string.",
		stringAlphadash: "The '{field}' field must be an alphadash string.",
		stringHex: "The '{field}' field must be a hex string.",
		stringSingleLine: "The '{field}' field must be a single line string.",
		stringBase64: "The '{field}' field must be a base64 string.",

		number: "The '{field}' field must be a number.",
		numberMin: "The '{field}' field must be greater than or equal to {expected}.",
		numberMax: "The '{field}' field must be less than or equal to {expected}.",
		numberEqual: "The '{field}' field must be equal to {expected}.",
		numberNotEqual: "The '{field}' field can't be equal to {expected}.",
		numberInteger: "The '{field}' field must be an integer.",
		numberPositive: "The '{field}' field must be a positive number.",
		numberNegative: "The '{field}' field must be a negative number.",

		array: "The '{field}' field must be an array.",
		arrayEmpty: "The '{field}' field must not be an empty array.",
		arrayMin: "The '{field}' field must contain at least {expected} items.",
		arrayMax: "The '{field}' field must contain less than or equal to {expected} items.",
		arrayLength: "The '{field}' field must contain {expected} items.",
		arrayContains: "The '{field}' field must contain the '{expected}' item.",
		arrayUnique: "The '{actual}' value in '{field}' field does not unique the '{expected}' values.",
		arrayEnum: "The '{actual}' value in '{field}' field does not match any of the '{expected}' values.",

		tuple: "The '{field}' field must be an array.",
		tupleEmpty: "The '{field}' field must not be an empty array.",
		tupleLength: "The '{field}' field must contain {expected} items.",

		boolean: "The '{field}' field must be a boolean.",

		currency: "The '{field}' must be a valid currency format",

		date: "The '{field}' field must be a Date.",
		dateMin: "The '{field}' field must be greater than or equal to {expected}.",
		dateMax: "The '{field}' field must be less than or equal to {expected}.",

		enumValue: "The '{field}' field value '{expected}' does not match any of the allowed values.",

		equalValue: "The '{field}' field value must be equal to '{expected}'.",
		equalField: "The '{field}' field value must be equal to '{expected}' field value.",

		forbidden: "The '{field}' field is forbidden.",

		function: "The '{field}' field must be a function.",

		email: "The '{field}' field must be a valid e-mail.",
		emailEmpty: "The '{field}' field must not be empty.",
		emailMin: "The '{field}' field length must be greater than or equal to {expected} characters long.",
		emailMax: "The '{field}' field length must be less than or equal to {expected} characters long.",

		luhn: "The '{field}' field must be a valid checksum luhn.",

		mac: "The '{field}' field must be a valid MAC address.",

		object: "The '{field}' must be an Object.",
		objectStrict: "The object '{field}' contains forbidden keys: '{actual}'.",
		objectMinProps: "The object '{field}' must contain at least {expected} properties.",
		objectMaxProps: "The object '{field}' must contain {expected} properties at most.",

		url: "The '{field}' field must be a valid URL.",
		urlEmpty: "The '{field}' field must not be empty.",

		uuid: "The '{field}' field must be a valid UUID.",
		uuidVersion: "The '{field}' field must be a valid UUID version provided.",

		classInstanceOf: "The '{field}' field must be an instance of the '{expected}' class.",

		objectID: "The '{field}' field must be an valid ObjectID",
	};
	return messages;
}

var any;
var hasRequiredAny;

function requireAny () {
	if (hasRequiredAny) return any;
	hasRequiredAny = 1;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	any = function(/*{ schema, messages }, path, context*/) {
		const src = [];
		src.push(`
		return value;
	`);

		return {
			source: src.join("\n")
		};
	};
	return any;
}

var array;
var hasRequiredArray;

function requireArray () {
	if (hasRequiredArray) return array;
	hasRequiredArray = 1;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	array = function ({ schema, messages }, path, context) {
		const src = [];

		src.push(`
		if (!Array.isArray(value)) {
			${this.makeError({ type: "array", actual: "value", messages })}
			return value;
		}

		var len = value.length;
	`);

		if (schema.empty === false) {
			src.push(`
			if (len === 0) {
				${this.makeError({ type: "arrayEmpty", actual: "value", messages })}
			}
		`);
		}

		if (schema.min != null) {
			src.push(`
			if (len < ${schema.min}) {
				${this.makeError({ type: "arrayMin", expected: schema.min, actual: "len", messages })}
			}
		`);
		}

		if (schema.max != null) {
			src.push(`
			if (len > ${schema.max}) {
				${this.makeError({ type: "arrayMax", expected: schema.max, actual: "len", messages })}
			}
		`);
		}

		if (schema.length != null) {
			src.push(`
			if (len !== ${schema.length}) {
				${this.makeError({ type: "arrayLength", expected: schema.length, actual: "len", messages })}
			}
		`);
		}

		if (schema.contains != null) {
			src.push(`
			if (value.indexOf(${JSON.stringify(schema.contains)}) === -1) {
				${this.makeError({ type: "arrayContains", expected: JSON.stringify(schema.contains), actual: "value", messages })}
			}
		`);
		}

		if (schema.unique === true) {
			src.push(`
			if(len > (new Set(value)).size) {
				${this.makeError({ type: "arrayUnique", expected: "Array.from(new Set(value.filter((item, index) => value.indexOf(item) !== index)))", actual: "value", messages })}
			}
		`);
		}

		if (schema.enum != null) {
			const enumStr = JSON.stringify(schema.enum);
			src.push(`
			for (var i = 0; i < value.length; i++) {
				if (${enumStr}.indexOf(value[i]) === -1) {
					${this.makeError({ type: "arrayEnum", expected: "\"" + schema.enum.join(", ") + "\"", actual: "value[i]", messages })}
				}
			}
		`);
		}

		if (schema.items != null) {
			src.push(`
			var arr = value;
			var parentField = field;
			for (var i = 0; i < arr.length; i++) {
				value = arr[i];
		`);

			const itemPath = path + "[]";
			const rule = this.getRuleFromSchema(schema.items);
			// eslint-disable-next-line quotes
			const innerSource = `arr[i] = ${context.async ? "await " : ""}context.fn[%%INDEX%%](arr[i], (parentField ? parentField : "") + "[" + i + "]", parent, errors, context)`;
			src.push(this.compileRule(rule, context, itemPath, innerSource, "arr[i]"));
			src.push(`
			}
		`);
			src.push(`
		return arr;
	`);
		} else {
			src.push(`
		return value;
	`);
		}

		return {
			source: src.join("\n")
		};
	};
	return array;
}

var boolean;
var hasRequiredBoolean;

function requireBoolean () {
	if (hasRequiredBoolean) return boolean;
	hasRequiredBoolean = 1;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	boolean = function({ schema, messages }, path, context) {
		const src = [];
		let sanitized = false;

		src.push(`
		var origValue = value;
	`);

		if (schema.convert === true) {
			sanitized = true;
			src.push(`
			if (typeof value !== "boolean") {
				if (
				value === 1
				|| value === "true"
				|| value === "1"
				|| value === "on"
				) {
					value = true;
				} else if (
				value === 0
				|| value === "false"
				|| value === "0"
				|| value === "off"
				) {
					value = false;
				}
			}
		`);
		}

		src.push(`
		if (typeof value !== "boolean") {
			${this.makeError({ type: "boolean",  actual: "origValue", messages })}
		}
		
		return value;
	`);

		return {
			sanitized,
			source: src.join("\n")
		};
	};
	return boolean;
}

var _class;
var hasRequired_class;

function require_class () {
	if (hasRequired_class) return _class;
	hasRequired_class = 1;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	_class = function({ schema, messages, index }, path, context) {
		const src = [];

		const className = schema.instanceOf.name ? schema.instanceOf.name : "<UnknowClass>";
		if (!context.customs[index]) context.customs[index] = { schema };
		else context.customs[index].schema = schema;

		src.push(`
		if (!(value instanceof context.customs[${index}].schema.instanceOf))
			${this.makeError({ type: "classInstanceOf",  actual: "value", expected: "'" + className + "'", messages })}
	`);

		src.push(`
		return value;
	`);

		return {
			source: src.join("\n")
		};
	};
	return _class;
}

var custom;
var hasRequiredCustom;

function requireCustom () {
	if (hasRequiredCustom) return custom;
	hasRequiredCustom = 1;

	custom = function ({ schema, messages, index }, path, context) {
		const src = [];

		src.push(`
		${this.makeCustomValidator({ fnName: "check", path, schema, messages, context, ruleIndex: index })}
		return value;
	`);

		return {
			source: src.join("\n")
		};
	};
	return custom;
}

var currency;
var hasRequiredCurrency;

function requireCurrency () {
	if (hasRequiredCurrency) return currency;
	hasRequiredCurrency = 1;
	const CURRENCY_REGEX = "(?=.*\\d)^(-?~1|~1-?)(([0-9]\\d{0,2}(~2\\d{3})*)|0)?(\\~3\\d{1,2})?$";
	/**	Signature: function(value, field, parent, errors, context)
	 */

	currency = function ({schema, messages}, path, context) {
		const currencySymbol = schema.currencySymbol || null;
		const thousandSeparator = schema.thousandSeparator || ",";
		const decimalSeparator = schema.decimalSeparator || ".";
		const customRegex = schema.customRegex;
		let isCurrencySymbolMandatory = !schema.symbolOptional;
		let finalRegex = CURRENCY_REGEX.replace(/~1/g, currencySymbol ? (`\\${currencySymbol}${(isCurrencySymbolMandatory ? "" : "?")}`) : "")
			.replace("~2", thousandSeparator)
			.replace("~3", decimalSeparator);


		const src = [];

		src.push(`
		if (!value.match(${customRegex || new RegExp(finalRegex)})) {
			${this.makeError({ type: "currency", actual: "value", messages })}
			return value;
		}

		return value;
	`);

		return {
			source: src.join("\n")
		};
	};
	return currency;
}

var date;
var hasRequiredDate;

function requireDate () {
	if (hasRequiredDate) return date;
	hasRequiredDate = 1;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	date = function({ schema, messages }, path, context) {
		const src = [];
		let sanitized = false;

		src.push(`
		var origValue = value;
	`);

		if (schema.convert === true) {
			sanitized = true;
			src.push(`
			if (!(value instanceof Date)) {
				value = new Date(value);
			}
		`);
		}

		src.push(`
		if (!(value instanceof Date) || isNaN(value.getTime()))
			${this.makeError({ type: "date",  actual: "origValue", messages })}

		return value;
	`);

		return {
			sanitized,
			source: src.join("\n")
		};
	};
	return date;
}

var email$1;
var hasRequiredEmail;

function requireEmail () {
	if (hasRequiredEmail) return email$1;
	hasRequiredEmail = 1;

	const PRECISE_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	const BASIC_PATTERN = /^\S+@\S+\.\S+$/;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	email$1 = function({ schema, messages }, path, context) {
		const src = [];

		const pattern = schema.mode == "precise" ? PRECISE_PATTERN : BASIC_PATTERN;
		let sanitized = false;

		src.push(`
		if (typeof value !== "string") {
			${this.makeError({ type: "string",  actual: "value", messages })}
			return value;
		}
	`);

		if (!schema.empty) {
			src.push(`
			if (value.length === 0) {
				${this.makeError({ type: "emailEmpty", actual: "value", messages })}
				return value;
			}
		`);
		} else {
			src.push(`
			if (value.length === 0) return value;
		`);
		}

		if (schema.normalize) {
			sanitized = true;
			src.push(`
			value = value.trim().toLowerCase();
		`);
		}

		if (schema.min != null) {
			src.push(`
			if (value.length < ${schema.min}) {
				${this.makeError({ type: "emailMin", expected: schema.min, actual: "value.length", messages })}
			}
		`);
		}

		if (schema.max != null) {
			src.push(`
			if (value.length > ${schema.max}) {
				${this.makeError({ type: "emailMax", expected: schema.max, actual: "value.length", messages })}
			}
		`);
		}

		src.push(`
		if (!${pattern.toString()}.test(value)) {
			${this.makeError({ type: "email",  actual: "value", messages })}
		}

		return value;
	`);

		return {
			sanitized,
			source: src.join("\n")
		};
	};
	return email$1;
}

var _enum;
var hasRequired_enum;

function require_enum () {
	if (hasRequired_enum) return _enum;
	hasRequired_enum = 1;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	_enum = function({ schema, messages }, path, context) {
		const enumStr = JSON.stringify(schema.values || []);
		return {
			source: `
			if (${enumStr}.indexOf(value) === -1)
				${this.makeError({ type: "enumValue", expected: "\"" + schema.values.join(", ") + "\"", actual: "value", messages })}
			
			return value;
		`
		};
	};
	return _enum;
}

var equal;
var hasRequiredEqual;

function requireEqual () {
	if (hasRequiredEqual) return equal;
	hasRequiredEqual = 1;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	equal = function({ schema, messages }, path, context) {
		const src = [];

		if (schema.field) {
			if (schema.strict) {
				src.push(`
				if (value !== parent["${schema.field}"])
			`);
			} else {
				src.push(`
				if (value != parent["${schema.field}"])
			`);
			}
			src.push(`
				${this.makeError({ type: "equalField",  actual: "value", expected: JSON.stringify(schema.field), messages })}
		`);
		} else {
			if (schema.strict) {
				src.push(`
				if (value !== ${JSON.stringify(schema.value)})
			`);
			} else {
				src.push(`
				if (value != ${JSON.stringify(schema.value)})
			`);
			}
			src.push(`
				${this.makeError({ type: "equalValue",  actual: "value", expected: JSON.stringify(schema.value), messages })}
		`);
		}

		src.push(`
		return value;
	`);

		return {
			source: src.join("\n")
		};
	};
	return equal;
}

var forbidden;
var hasRequiredForbidden;

function requireForbidden () {
	if (hasRequiredForbidden) return forbidden;
	hasRequiredForbidden = 1;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	forbidden = function checkForbidden({ schema, messages }, path, context) {
		const src = [];

		src.push(`
		if (value !== null && value !== undefined) {
	`);

		if (schema.remove) {
			src.push(`
			return undefined;
		`);

		} else {
			src.push(`
			${this.makeError({ type: "forbidden",  actual: "value", messages })}
		`);
		}

		src.push(`
		}

		return value;
	`);

		return {
			source: src.join("\n")
		};
	};
	return forbidden;
}

var _function;
var hasRequired_function;

function require_function () {
	if (hasRequired_function) return _function;
	hasRequired_function = 1;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	_function = function({ schema, messages }, path, context) {
		return {
			source: `
			if (typeof value !== "function")
				${this.makeError({ type: "function",  actual: "value", messages })}

			return value;
		`
		};
	};
	return _function;
}

var multi;
var hasRequiredMulti;

function requireMulti () {
	if (hasRequiredMulti) return multi;
	hasRequiredMulti = 1;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	multi = function({ schema, messages }, path, context) {
		const src = [];

		src.push(`
		var hasValid = false;
		var newVal = value;
		var checkErrors = [];
	`);

		for (let i = 0; i < schema.rules.length; i++) {
			src.push(`
			if (!hasValid) {
				var _errors = [];
		`);

			const rule = this.getRuleFromSchema(schema.rules[i]);
			src.push(this.compileRule(rule, context, path, `var tmpVal = ${context.async ? "await " : ""}context.fn[%%INDEX%%](value, field, parent, _errors, context);`, "tmpVal"));
			src.push(`
				if (_errors.length == 0) {
					hasValid = true;
					newVal = tmpVal;
				} else {
					Array.prototype.push.apply(checkErrors, _errors);
				}
			}
		`);
		}

		src.push(`
		if (!hasValid) {
			Array.prototype.push.apply(errors, checkErrors);
		}

		return newVal;
	`);

		return {
			source: src.join("\n")
		};
	};
	return multi;
}

var number;
var hasRequiredNumber;

function requireNumber () {
	if (hasRequiredNumber) return number;
	hasRequiredNumber = 1;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	number = function({ schema, messages }, path, context) {
		const src = [];

		src.push(`
		var origValue = value;
	`);

		let sanitized = false;
		if (schema.convert === true) {
			sanitized = true;
			src.push(`
			if (typeof value !== "number") {
				value = Number(value);
			}
		`);
		}

		src.push(`
		if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
			${this.makeError({ type: "number",  actual: "origValue", messages })}
			return value;
		}
	`);

		if (schema.min != null) {
			src.push(`
			if (value < ${schema.min}) {
				${this.makeError({ type: "numberMin", expected: schema.min, actual: "origValue", messages })}
			}
		`);
		}

		if (schema.max != null) {
			src.push(`
			if (value > ${schema.max}) {
				${this.makeError({ type: "numberMax", expected: schema.max, actual: "origValue", messages })}
			}
		`);
		}

		// Check fix value
		if (schema.equal != null) {
			src.push(`
			if (value !== ${schema.equal}) {
				${this.makeError({ type: "numberEqual", expected: schema.equal, actual: "origValue", messages })}
			}
		`);
		}

		// Check not fix value
		if (schema.notEqual != null) {
			src.push(`
			if (value === ${schema.notEqual}) {
				${this.makeError({ type: "numberNotEqual", expected: schema.notEqual, actual: "origValue", messages })}
			}
		`);
		}

		// Check integer
		if (schema.integer === true) {
			src.push(`
			if (value % 1 !== 0) {
				${this.makeError({ type: "numberInteger",  actual: "origValue", messages })}
			}
		`);
		}

		// Check positive
		if (schema.positive === true) {
			src.push(`
			if (value <= 0) {
				${this.makeError({ type: "numberPositive",  actual: "origValue", messages })}
			}
		`);
		}

		// Check negative
		if (schema.negative === true) {
			src.push(`
			if (value >= 0) {
				${this.makeError({ type: "numberNegative",  actual: "origValue", messages })}
			}
		`);
		}

		src.push(`
		return value;
	`);

		return {
			sanitized,
			source: src.join("\n")
		};
	};
	return number;
}

var object;
var hasRequiredObject;

function requireObject () {
	if (hasRequiredObject) return object;
	hasRequiredObject = 1;

	// Quick regex to match most common unquoted JavaScript property names. Note the spec allows Unicode letters.
	// Unmatched property names will be quoted and validate slighly slower. https://www.ecma-international.org/ecma-262/5.1/#sec-7.6
	const identifierRegex = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/;

	// Regex to escape quoted property names for eval/new Function
	const escapeEvalRegex = /["'\\\n\r\u2028\u2029]/g;

	/* istanbul ignore next */
	function escapeEvalString(str) {
		// Based on https://github.com/joliss/js-string-escape
		return str.replace(escapeEvalRegex, function (character) {
			switch (character) {
			case "\"":
			case "'":
			case "\\":
				return "\\" + character;
				// Four possible LineTerminator characters need to be escaped:
			case "\n":
				return "\\n";
			case "\r":
				return "\\r";
			case "\u2028":
				return "\\u2028";
			case "\u2029":
				return "\\u2029";
			}
		});
	}

	/**	Signature: function(value, field, parent, errors, context)
	 */
	object = function ({ schema, messages }, path, context) {
		const sourceCode = [];

		sourceCode.push(`
		if (typeof value !== "object" || value === null || Array.isArray(value)) {
			${this.makeError({ type: "object", actual: "value", messages })}
			return value;
		}
	`);

		const subSchema = schema.properties || schema.props;
		if (subSchema) {
			sourceCode.push("var parentObj = value;");
			sourceCode.push("var parentField = field;");

			const keys = Object.keys(subSchema);

			for (let i = 0; i < keys.length; i++) {
				const property = keys[i];

				const name = escapeEvalString(property);
				const safeSubName = identifierRegex.test(name) ? `.${name}` : `['${name}']`;
				const safePropName = `parentObj${safeSubName}`;
				const newPath = (path ? path + "." : "") + property;

				sourceCode.push(`\n// Field: ${escapeEvalString(newPath)}`);
				sourceCode.push(`field = parentField ? parentField + "${safeSubName}" : "${name}";`);
				sourceCode.push(`value = ${safePropName};`);

				const rule = this.getRuleFromSchema(subSchema[property]);
				const innerSource = `
				${safePropName} = ${context.async ? "await " : ""}context.fn[%%INDEX%%](value, field, parentObj, errors, context);
			`;
				sourceCode.push(this.compileRule(rule, context, newPath, innerSource, safePropName));
			}

			// Strict handler
			if (schema.strict) {
				sourceCode.push(`
				if (errors.length === 0) {
			`);
				const allowedProps = Object.keys(subSchema);

				sourceCode.push(`
					field = parentField;
					var invalidProps = [];
					var props = Object.keys(parentObj);

					for (let i = 0; i < props.length; i++) {
						if (${JSON.stringify(allowedProps)}.indexOf(props[i]) === -1) {
							invalidProps.push(props[i]);
						}
					}
					if (invalidProps.length) {
			`);
				if (schema.strict == "remove") {
					sourceCode.push(`
						invalidProps.forEach(function(field) {
							delete parentObj[field];
						});
				`);
				} else {
					sourceCode.push(`
					${this.makeError({ type: "objectStrict", expected: "\"" + allowedProps.join(", ") + "\"", actual: "invalidProps.join(', ')", messages })}
				`);
				}
				sourceCode.push(`
					}
			`);
				sourceCode.push(`
				}
			`);
			}
		}

		if (schema.minProps != null || schema.maxProps != null) {
			// We recalculate props, because:
			//	- if strict equals 'remove', we want to work on
			//	the payload with the extra keys removed,
			//	- if no strict is set, we need them anyway.
			if (schema.strict) {
				sourceCode.push(`
				props = Object.keys(${subSchema ? "parentObj" : "value"});
			`);
			} else {
				sourceCode.push(`
				var props = Object.keys(${subSchema ? "parentObj" : "value"});
				${subSchema ? "field = parentField;" : ""}
			`);
			}
		}

		if (schema.minProps != null) {
			sourceCode.push(`
			if (props.length < ${schema.minProps}) {
				${this.makeError({ type: "objectMinProps", expected: schema.minProps, actual: "props.length", messages })}
			}
		`);
		}

		if (schema.maxProps != null) {
			sourceCode.push(`
			if (props.length > ${schema.maxProps}) {
				${this.makeError({ type: "objectMaxProps", expected: schema.maxProps, actual: "props.length", messages })}
			}
		`);
		}

		if (subSchema) {
			sourceCode.push(`
			return parentObj;
		`);
		} else {
			sourceCode.push(`
			return value;
		`);
		}

		return {
			source: sourceCode.join("\n")
		};
	};
	return object;
}

var objectID;
var hasRequiredObjectID;

function requireObjectID () {
	if (hasRequiredObjectID) return objectID;
	hasRequiredObjectID = 1;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	objectID = function({ schema, messages, index }, path, context) {
		const src = [];

		if (!context.customs[index]) context.customs[index] = { schema };
		else context.customs[index].schema = schema;

		src.push(`
		const ObjectID = context.customs[${index}].schema.ObjectID;
		if (!ObjectID.isValid(value)) {
			${this.makeError({ type: "objectID", actual: "value", messages })}
			return;
		}
	`);

		if (schema.convert === true) src.push("return new ObjectID(value)");
		else if (schema.convert === "hexString") src.push("return value.toString()");
		else src.push("return value");

		return {
			source: src.join("\n")
		};
	};
	return objectID;
}

var string;
var hasRequiredString;

function requireString () {
	if (hasRequiredString) return string;
	hasRequiredString = 1;

	const NUMERIC_PATTERN = /^-?[0-9]\d*(\.\d+)?$/;
	const ALPHA_PATTERN = /^[a-zA-Z]+$/;
	const ALPHANUM_PATTERN = /^[a-zA-Z0-9]+$/;
	const ALPHADASH_PATTERN = /^[a-zA-Z0-9_-]+$/;
	const HEX_PATTERN = /^[0-9a-fA-F]+$/;
	const BASE64_PATTERN = /^(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	string = function checkString({ schema, messages }, path, context) {
		const src = [];
		let sanitized = false;

		if (schema.convert === true) {
			sanitized = true;
			src.push(`
			if (typeof value !== "string") {
				value = String(value);
			}
		`);
		}

		src.push(`
		if (typeof value !== "string") {
			${this.makeError({ type: "string", actual: "value", messages })}
			return value;
		}

		var origValue = value;
	`);

		if (schema.trim) {
			sanitized = true;
			src.push(`
			value = value.trim();
		`);
		}

		if (schema.trimLeft) {
			sanitized = true;
			src.push(`
			value = value.trimLeft();
		`);
		}

		if (schema.trimRight) {
			sanitized = true;
			src.push(`
			value = value.trimRight();
		`);
		}

		if (schema.padStart) {
			sanitized = true;
			const padChar = schema.padChar != null ? schema.padChar : " ";
			src.push(`
			value = value.padStart(${schema.padStart}, ${JSON.stringify(padChar)});
		`);
		}

		if (schema.padEnd) {
			sanitized = true;
			const padChar = schema.padChar != null ? schema.padChar : " ";
			src.push(`
			value = value.padEnd(${schema.padEnd}, ${JSON.stringify(padChar)});
		`);
		}

		if (schema.lowercase) {
			sanitized = true;
			src.push(`
			value = value.toLowerCase();
		`);
		}

		if (schema.uppercase) {
			sanitized = true;
			src.push(`
			value = value.toUpperCase();
		`);
		}

		if (schema.localeLowercase) {
			sanitized = true;
			src.push(`
			value = value.toLocaleLowerCase();
		`);
		}

		if (schema.localeUppercase) {
			sanitized = true;
			src.push(`
			value = value.toLocaleUpperCase();
		`);
		}

		src.push(`
			var len = value.length;
	`);

		if (schema.empty === false) {
			src.push(`
			if (len === 0) {
				${this.makeError({ type: "stringEmpty",  actual: "value", messages })}
			}
		`);
		}

		if (schema.min != null) {
			src.push(`
			if (len < ${schema.min}) {
				${this.makeError({ type: "stringMin", expected: schema.min, actual: "len", messages })}
			}
		`);
		}

		if (schema.max != null) {
			src.push(`
			if (len > ${schema.max}) {
				${this.makeError({ type: "stringMax", expected: schema.max, actual: "len", messages })}
			}
		`);
		}

		if (schema.length != null) {
			src.push(`
			if (len !== ${schema.length}) {
				${this.makeError({ type: "stringLength", expected: schema.length, actual: "len", messages })}
			}
		`);
		}

		if (schema.pattern != null) {
			let pattern = schema.pattern;
			if (typeof schema.pattern == "string")
				pattern = new RegExp(schema.pattern, schema.patternFlags);

			const patternValidator = `
			if (!${pattern.toString()}.test(value))
				${this.makeError({ type: "stringPattern", expected: `"${pattern.toString().replace(/"/g, "\\$&")}"`, actual: "origValue", messages })}
		`;

			src.push(`
			if (${schema.empty} === true && len === 0) {
				// Do nothing
			} else {
				${patternValidator}
			}
		`);
		}

		if (schema.contains != null) {
			src.push(`
			if (value.indexOf("${schema.contains}") === -1) {
				${this.makeError({ type: "stringContains", expected: "\"" + schema.contains + "\"", actual: "origValue", messages })}
			}
		`);
		}

		if (schema.enum != null) {
			const enumStr = JSON.stringify(schema.enum);
			src.push(`
			if (${enumStr}.indexOf(value) === -1) {
				${this.makeError({ type: "stringEnum", expected: "\"" + schema.enum.join(", ") + "\"", actual: "origValue", messages })}
			}
		`);
		}

		if (schema.numeric === true) {
			src.push(`
			if (!${NUMERIC_PATTERN.toString()}.test(value) ) {
				${this.makeError({ type: "stringNumeric",  actual: "origValue", messages })}
			}
		`);
		}

		if(schema.alpha === true) {
			src.push(`
			if(!${ALPHA_PATTERN.toString()}.test(value)) {
				${this.makeError({ type: "stringAlpha",  actual: "origValue", messages })}
			}
		`);
		}

		if(schema.alphanum === true) {
			src.push(`
			if(!${ALPHANUM_PATTERN.toString()}.test(value)) {
				${this.makeError({ type: "stringAlphanum",  actual: "origValue", messages })}
			}
		`);
		}

		if(schema.alphadash === true) {
			src.push(`
			if(!${ALPHADASH_PATTERN.toString()}.test(value)) {
				${this.makeError({ type: "stringAlphadash",  actual: "origValue", messages })}
			}
		`);
		}

		if(schema.hex === true) {
			src.push(`
			if(value.length % 2 !== 0 || !${HEX_PATTERN.toString()}.test(value)) {
				${this.makeError({ type: "stringHex",  actual: "origValue", messages })}
			}
		`);
		}

		if(schema.singleLine === true) {
			src.push(`
			if(value.includes("\\n")) {
				${this.makeError({ type: "stringSingleLine", messages })}
			}
		`);
		}


		if(schema.base64 === true) {
			src.push(`
			if(!${BASE64_PATTERN.toString()}.test(value)) {
				${this.makeError({ type: "stringBase64",  actual: "origValue", messages })}
			}
		`);
		}

		src.push(`
		return value;
	`);

		return {
			sanitized,
			source: src.join("\n")
		};
	};
	return string;
}

var tuple;
var hasRequiredTuple;

function requireTuple () {
	if (hasRequiredTuple) return tuple;
	hasRequiredTuple = 1;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	tuple = function ({ schema, messages }, path, context) {
		const src = [];

		if (schema.items != null) {
			if (!Array.isArray(schema.items)) {
				throw new Error(`Invalid '${schema.type}' schema. The 'items' field must be an array.`);
			}

			if (schema.items.length === 0) {
				throw new Error(`Invalid '${schema.type}' schema. The 'items' field must not be an empty array.`);
			}
		}

		src.push(`
		if (!Array.isArray(value)) {
			${this.makeError({ type: "tuple", actual: "value", messages })}
			return value;
		}

		var len = value.length;
	`);


		if (schema.empty === false) {
			src.push(`
			if (len === 0) {
				${this.makeError({ type: "tupleEmpty", actual: "value", messages })}
				return value;
			}
		`);
		}

		if (schema.items != null) {
			src.push(`
			if (${schema.empty} !== false && len === 0) {
				return value;
			}

			if (len !== ${schema.items.length}) {
				${this.makeError({type: "tupleLength", expected: schema.items.length, actual: "len", messages})}
				return value;
			}
		`);

			src.push(`
			var arr = value;
			var parentField = field;
		`);

			for (let i = 0; i < schema.items.length; i++) {
				src.push(`
			value = arr[${i}];
		`);

				const itemPath = `${path}[${i}]`;
				const rule = this.getRuleFromSchema(schema.items[i]);
				const innerSource = `
			arr[${i}] = ${context.async ? "await " : ""}context.fn[%%INDEX%%](arr[${i}], (parentField ? parentField : "") + "[" + ${i} + "]", parent, errors, context);
		`;
				src.push(this.compileRule(rule, context, itemPath, innerSource, `arr[${i}]`));
			}
			src.push(`
		return arr;
	`);
		} else {
			src.push(`
		return value;
	`);
		}

		return {
			source: src.join("\n")
		};
	};
	return tuple;
}

var url;
var hasRequiredUrl;

function requireUrl () {
	if (hasRequiredUrl) return url;
	hasRequiredUrl = 1;

	const PATTERN = /^https?:\/\/\S+/;
	//const PATTERN = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
	//const PATTERN = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	url = function ({ schema, messages }, path, context) {
		const src = [];

		src.push(`
		if (typeof value !== "string") {
			${this.makeError({ type: "string", actual: "value", messages })}
			return value;
		}
	`);

		if (!schema.empty) {
			src.push(`
			if (value.length === 0) {
				${this.makeError({ type: "urlEmpty", actual: "value", messages })}
				return value;
			}
		`);
		} else {
			src.push(`
			if (value.length === 0) return value;
		`);
		}

		src.push(`
		if (!${PATTERN.toString()}.test(value)) {
			${this.makeError({ type: "url", actual: "value", messages })}
		}

		return value;
	`);

		return {
			source: src.join("\n"),
		};
	};
	return url;
}

var uuid;
var hasRequiredUuid;

function requireUuid () {
	if (hasRequiredUuid) return uuid;
	hasRequiredUuid = 1;

	const PATTERN = /^([0-9a-f]{8}-[0-9a-f]{4}-[1-6][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}|[0]{8}-[0]{4}-[0]{4}-[0]{4}-[0]{12})$/i;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	uuid = function({ schema, messages }, path) {
		const src = [];
		src.push(`
		if (typeof value !== "string") {
			${this.makeError({ type: "string",  actual: "value", messages })}
			return value;
		}

		var val = value.toLowerCase();
		if (!${PATTERN.toString()}.test(val)) {
			${this.makeError({ type: "uuid",  actual: "value", messages })}
			return value;
		}

		const version = val.charAt(14) | 0;
	`);

		if(parseInt(schema.version) < 7) {
			src.push(`
			if (${schema.version} !== version) {
				${this.makeError({ type: "uuidVersion", expected: schema.version, actual: "version", messages })}
				return value;
			}
		`);
		}

		src.push(`
		switch (version) {
		case 0:
		case 1:
		case 2:
		case 6:
			break;
		case 3:
		case 4:
		case 5:
			if (["8", "9", "a", "b"].indexOf(val.charAt(19)) === -1) {
				${this.makeError({ type: "uuid",  actual: "value", messages })}
			}
		}

		return value;
	`);

		return {
			source: src.join("\n")
		};
	};
	return uuid;
}

var mac;
var hasRequiredMac;

function requireMac () {
	if (hasRequiredMac) return mac;
	hasRequiredMac = 1;

	const PATTERN = /^((([a-f0-9][a-f0-9]+[-]){5}|([a-f0-9][a-f0-9]+[:]){5})([a-f0-9][a-f0-9])$)|(^([a-f0-9][a-f0-9][a-f0-9][a-f0-9]+[.]){2}([a-f0-9][a-f0-9][a-f0-9][a-f0-9]))$/i;

	/**	Signature: function(value, field, parent, errors, context)
	 */
	mac = function({ schema, messages }, path, context) {
		return {
			source: `
			if (typeof value !== "string") {
				${this.makeError({ type: "string",  actual: "value", messages })}
				return value;
			}

			var v = value.toLowerCase();
			if (!${PATTERN.toString()}.test(v)) {
				${this.makeError({ type: "mac",  actual: "value", messages })}
			}
			
			return value;
		`
		};
	};
	return mac;
}

var luhn;
var hasRequiredLuhn;

function requireLuhn () {
	if (hasRequiredLuhn) return luhn;
	hasRequiredLuhn = 1;

	/**
	 * Luhn algorithm checksum https://en.wikipedia.org/wiki/Luhn_algorithm
	 * Credit Card numbers, IMEI numbers, National Provider Identifier numbers and others
	 * @param value
	 * @param schema
	 * @return {boolean|{actual, expected, type}|ValidationError}
	 *
	 *	Signature: function(value, field, parent, errors, context)
	 */
	luhn = function({ schema, messages }, path, context) {
		return {
			source: `
			if (typeof value !== "string") {
				${this.makeError({ type: "string",  actual: "value", messages })}
				return value;
			}

			if (typeof value !== "string")
				value = String(value);

			val = value.replace(/\\D+/g, "");

			var array = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
			var len = val ? val.length : 0,
				bit = 1,
				sum = 0;
			while (len--) {
				sum += !(bit ^= 1) ? parseInt(val[len], 10) : array[val[len]];
			}

			if (!(sum % 10 === 0 && sum > 0)) {
				${this.makeError({ type: "luhn",  actual: "value", messages })}
			}

			return value;
		`
		};
	};
	return luhn;
}

function commonjsRequire(path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

var prettier_1;
var hasRequiredPrettier;

function requirePrettier () {
	if (hasRequiredPrettier) return prettier_1;
	hasRequiredPrettier = 1;
	// globals window
	let prettier, prettierOpts;
	let hljs, hljsOpts;

	let mod1 = "prettier"; // rollup
	let mod2 = "cli-highlight"; // rollup

	prettier_1 = function(source) {
		if (!prettier) {
			prettier = commonjsRequire(mod1);
			prettierOpts = {
				parser: "babel",
				useTabs: false,
				printWidth: 120,
				trailingComma: "none",
				tabWidth: 4,
				singleQuote: false,
				semi: true,
				bracketSpacing: true
			};

			hljs = commonjsRequire(mod2);
			hljsOpts = {
				language: "js",
				theme: hljs.fromJson({
					keyword: ["white", "bold"],
					built_in: "magenta",
					literal: "cyan",
					number: "magenta",
					regexp: "red",
					string: ["yellow", "bold"],
					symbol: "plain",
					class: "blue",
					attr: "plain",
					function: ["white", "bold"],
					title: "plain",
					params: "green",
					comment: "grey"
				})
			};
		}

		const res = prettier.format(source, prettierOpts);
		return hljs.highlight(res, hljsOpts);
	};
	return prettier_1;
}

let AsyncFunction;
try {
	AsyncFunction = (new Function("return Object.getPrototypeOf(async function(){}).constructor"))();
} catch(err) { /* async is not supported */}

const deepExtend = deepExtend_1;
const replace = replace$1;

function loadMessages() {
	return Object.assign({} , requireMessages());
}

function loadRules() {
	return {
		any: requireAny(),
		array: requireArray(),
		boolean: requireBoolean(),
		class: require_class(),
		custom: requireCustom(),
		currency: requireCurrency(),
		date: requireDate(),
		email: requireEmail(),
		enum: require_enum(),
		equal: requireEqual(),
		forbidden: requireForbidden(),
		function: require_function(),
		multi: requireMulti(),
		number: requireNumber(),
		object: requireObject(),
		objectID: requireObjectID(),
		string: requireString(),
		tuple: requireTuple(),
		url: requireUrl(),
		uuid: requireUuid(),
		mac: requireMac(),
		luhn: requireLuhn()
	};
}

/**
 * Fastest Validator
 */
class Validator {

	/**
	 * Validator class constructor
	 *
	 * @param {Object} opts
	 */
	constructor(opts) {
		this.opts = {};
		this.defaults = {};
		this.messages = loadMessages();
		this.rules = loadRules();
		this.aliases = {};
		this.cache = new Map();

		if (opts) {
			deepExtend(this.opts, opts);
			if (opts.defaults) deepExtend(this.defaults, opts.defaults);

			if (opts.messages) {
				for (const messageName in opts.messages) this.addMessage(messageName, opts.messages[messageName]);
			}

			if (opts.aliases) {
				for (const aliasName in opts.aliases) this.alias(aliasName, opts.aliases[aliasName]);
			}

			if (opts.customRules) {
				for (const ruleName in opts.customRules) this.add(ruleName, opts.customRules[ruleName]);
			}

			if (opts.plugins) {
				const plugins = opts.plugins;
				if (!Array.isArray(plugins)) throw new Error("Plugins type must be array");
				plugins.forEach(this.plugin.bind(this));
			}

			/* istanbul ignore next */
			if (this.opts.debug) {
				let formatter = function (code) { return code; };
				if (typeof window === "undefined") {
					formatter = requirePrettier();
				}

				this._formatter = formatter;
			}
		}
	}

	/**
	 * Validate an object by schema
	 *
	 * @param {Object} obj
	 * @param {Object} schema
	 * @returns {Array<Object>|boolean}
	 */
	validate(obj, schema) {
		const check = this.compile(schema);
		return check(obj);
	}

	/**
	 * Wrap a source code with `required` & `optional` checker codes.
	 * @param {Object} rule
	 * @param {String} innerSrc
	 * @param {String?} resVar
	 * @returns {String}
	 */
	wrapRequiredCheckSourceCode(rule, innerSrc, context, resVar) {
		const src = [];
		let handleNoValue;

		let skipUndefinedValue = rule.schema.optional === true || rule.schema.type === "forbidden";
		let skipNullValue = rule.schema.optional === true || rule.schema.nullable === true || rule.schema.type === "forbidden";

		if (rule.schema.default != null) {
			// We should set default-value when value is undefined or null, not skip! (Except when null is allowed)
			skipUndefinedValue = false;
			if (rule.schema.nullable !== true) skipNullValue = false;

			let defaultValue;
			if (typeof rule.schema.default === "function") {
				if (!context.customs[rule.index]) context.customs[rule.index] = {};
				context.customs[rule.index].defaultFn = rule.schema.default;
				defaultValue = `context.customs[${rule.index}].defaultFn.call(this, context.rules[${rule.index}].schema, field, parent, context)`;
			} else {
				defaultValue = JSON.stringify(rule.schema.default);
			}

			handleNoValue = `
				value = ${defaultValue};
				${resVar} = value;
			`;

		} else {
			handleNoValue = this.makeError({ type: "required", actual: "value", messages: rule.messages });
		}


		src.push(`
			${`if (value === undefined) { ${skipUndefinedValue ? "\n// allow undefined\n" : handleNoValue} }`}
			${`else if (value === null) { ${skipNullValue ? "\n// allow null\n" : handleNoValue} }`}
			${innerSrc ? `else { ${innerSrc} }` : ""}
		`);
		return src.join("\n");
	}

	/**
	 * Compile a schema
	 *
	 * @param {Object} schema
	 * @throws {Error} Invalid schema
	 * @returns {Function}
	 */
	compile(schema) {
		if (schema === null || typeof schema !== "object") {
			throw new Error("Invalid schema.");
		}

		const self = this;
		const context = {
			index: 0,
			async: schema.$$async === true,
			rules: [],
			fn: [],
			customs: {},
			utils: {
				replace,
			},
		};
		this.cache.clear();
		delete schema.$$async;

		/* istanbul ignore next */
		if (context.async && !AsyncFunction) {
			throw new Error("Asynchronous mode is not supported.");
		}

		if (schema.$$root !== true) {
			if (Array.isArray(schema)) {
				const rule = this.getRuleFromSchema(schema);
				schema = rule.schema;
			} else {
				const prevSchema = Object.assign({}, schema);
				schema = {
					type: "object",
					strict: prevSchema.$$strict,
					properties: prevSchema
				};

				delete prevSchema.$$strict;
			}
		}

		const sourceCode = [
			"var errors = [];",
			"var field;",
			"var parent = null;",
		];

		const rule = this.getRuleFromSchema(schema);
		sourceCode.push(this.compileRule(rule, context, null, `${context.async ? "await " : ""}context.fn[%%INDEX%%](value, field, null, errors, context);`, "value"));

		sourceCode.push("if (errors.length) {");
		sourceCode.push(`
			return errors.map(err => {
				if (err.message) {
					err.message = context.utils.replace(err.message, /\\{field\\}/g, err.field);
					err.message = context.utils.replace(err.message, /\\{expected\\}/g, err.expected);
					err.message = context.utils.replace(err.message, /\\{actual\\}/g, err.actual);
				}

				return err;
			});
		`);

		sourceCode.push("}");
		sourceCode.push("return true;");

		const src = sourceCode.join("\n");

		const FnClass = context.async ? AsyncFunction : Function;
		const checkFn = new FnClass("value", "context", src);

		/* istanbul ignore next */
		if (this.opts.debug) {
			console.log(this._formatter("// Main check function\n" + checkFn.toString())); // eslint-disable-line no-console
		}

		this.cache.clear();

		const resFn = function (data, opts) {
			context.data = data;
			if (opts && opts.meta)
				context.meta = opts.meta;
			return checkFn.call(self, data, context);
		};
		resFn.async = context.async;
		return resFn;
	}

	/**
	 * Compile a rule to source code.
	 * @param {Object} rule
	 * @param {Object} context
	 * @param {String} path
	 * @param {String} innerSrc
	 * @param {String} resVar
	 * @returns {String}
	 */
	compileRule(rule, context, path, innerSrc, resVar) {
		const sourceCode = [];

		const item = this.cache.get(rule.schema);
		if (item) {
			// Handle cyclic schema
			rule = item;
			rule.cycle = true;
			rule.cycleStack = [];
			sourceCode.push(this.wrapRequiredCheckSourceCode(rule, `
				var rule = context.rules[${rule.index}];
				if (rule.cycleStack.indexOf(value) === -1) {
					rule.cycleStack.push(value);
					${innerSrc.replace(/%%INDEX%%/g, rule.index)}
					rule.cycleStack.pop(value);
				}
			`, context, resVar));

		} else {
			this.cache.set(rule.schema, rule);
			rule.index = context.index;
			context.rules[context.index] = rule;

			const customPath = path != null ? path : "$$root";

			context.index++;
			const res = rule.ruleFunction.call(this, rule, path, context);
			res.source = res.source.replace(/%%INDEX%%/g, rule.index);
			const FnClass = context.async ? AsyncFunction : Function;
			const fn = new FnClass("value", "field", "parent", "errors", "context", res.source);
			context.fn[rule.index] = fn.bind(this);
			sourceCode.push(this.wrapRequiredCheckSourceCode(rule, innerSrc.replace(/%%INDEX%%/g, rule.index), context, resVar));
			sourceCode.push(this.makeCustomValidator({vName: resVar, path: customPath, schema: rule.schema, context, messages: rule.messages, ruleIndex: rule.index}));

			/* istanbul ignore next */
			if (this.opts.debug) {
				console.log(this._formatter(`// Context.fn[${rule.index}]\n` + fn.toString())); // eslint-disable-line no-console
			}
		}

		return sourceCode.join("\n");
	}

	/**
	 * Create a rule instance from schema definition.
	 * @param {Object} schema
	 * @returns {Object} rule
	 */
	getRuleFromSchema(schema) {
		schema = this.resolveType(schema);

		const alias = this.aliases[schema.type];
		if (alias) {
			delete schema.type;
			schema = deepExtend(schema, alias, { skipIfExist: true });
		}

		const ruleFunction = this.rules[schema.type];
		if (!ruleFunction)
			throw new Error("Invalid '" + schema.type + "' type in validator schema.");

		const rule = {
			messages: Object.assign({}, this.messages, schema.messages),
			schema: deepExtend(schema, this.defaults[schema.type], { skipIfExist: true }),
			ruleFunction: ruleFunction,
		};

		return rule;
	}

	/**
	 * Parse rule from shorthand string
	 * @param {String} str shorthand string
	 * @param {Object} schema schema reference
	 */

	parseShortHand(str) {
		const p = str.split("|").map((s) => s.trim());
		let type = p[0];
		let schema;
		if (type.endsWith("[]")) {
			schema = this.getRuleFromSchema({ type: "array", items: type.slice(0, -2) }).schema;
		} else {
			schema = {
				type: p[0],
			};
		}

		p.slice(1).map((s) => {
			const idx = s.indexOf(":");
			if (idx !== -1) {
				const key = s.substr(0, idx).trim();
				let value = s.substr(idx + 1).trim();
				if (value === "true" || value === "false")
					value = value === "true";
				else if (!Number.isNaN(Number(value))) {
					value = Number(value);
				}
				schema[key] = value;
			} else {
				// boolean value
				if (s.startsWith("no-")) schema[s.slice(3)] = false;
				else schema[s] = true;
			}
		});

		return schema;
	}

	/**
	 * Generate error source code.
	 * @param {Object} opts
	 * @param {String} opts.type
	 * @param {String} opts.field
	 * @param {any} opts.expected
	 * @param {any} opts.actual
	 * @param {Object} opts.messages
	 */
	makeError({ type, field, expected, actual, messages }) {
		const o = {
			type: `"${type}"`,
			message: `"${messages[type]}"`,
		};
		if (field) o.field = `"${field}"`;
		else o.field = "field";
		if (expected != null) o.expected = expected;
		if (actual != null) o.actual = actual;

		const s = Object.keys(o)
			.map(key => `${key}: ${o[key]}`)
			.join(", ");

		return `errors.push({ ${s} });`;
	}

	/**
	 * Generate custom validator function source code.
	 * @param {Object} opts
	 * @param {String} opts.vName
	 * @param {String} opts.fnName
	 * @param {String} opts.ruleIndex
	 * @param {String} opts.path
	 * @param {Object} opts.schema
	 * @param {Object} opts.context
 	 * @param {Object} opts.messages
	 */
	makeCustomValidator({ vName = "value", fnName = "custom", ruleIndex, path, schema, context, messages }) {
		const ruleVName = "rule" + ruleIndex;
		const fnCustomErrorsVName = "fnCustomErrors" + ruleIndex;
		if (typeof schema[fnName] == "function") {
			if (context.customs[ruleIndex]) {
				context.customs[ruleIndex].messages = messages;
				context.customs[ruleIndex].schema = schema;
			}
			else context.customs[ruleIndex] = { messages, schema };

			if (this.opts.useNewCustomCheckerFunction) {
				return `
               		const ${ruleVName} = context.customs[${ruleIndex}];
					const ${fnCustomErrorsVName} = [];
					${vName} = ${context.async ? "await " : ""}${ruleVName}.schema.${fnName}.call(this, ${vName}, ${fnCustomErrorsVName} , ${ruleVName}.schema, "${path}", parent, context);
					if (Array.isArray(${fnCustomErrorsVName} )) {
                  		${fnCustomErrorsVName} .forEach(err => errors.push(Object.assign({ message: ${ruleVName}.messages[err.type], field }, err)));
					}
				`;
			}

			const result = "res_" + ruleVName;
			return `
				const ${ruleVName} = context.customs[${ruleIndex}];
				const ${result} = ${context.async ? "await " : ""}${ruleVName}.schema.${fnName}.call(this, ${vName}, ${ruleVName}.schema, "${path}", parent, context);
				if (Array.isArray(${result})) {
					${result}.forEach(err => errors.push(Object.assign({ message: ${ruleVName}.messages[err.type], field }, err)));
				}
		`;
		}
		return "";
	}

	/**
	 * Add a custom rule
	 *
	 * @param {String} type
	 * @param {Function} fn
	 */
	add(type, fn) {
		this.rules[type] = fn;
	}

	/**
	 * Add a message
	 *
	 * @param {String} name
	 * @param {String} message
	 */
	addMessage(name, message) {
		this.messages[name] = message;
	}

	/**
	 * create alias name for a rule
	 *
	 * @param {String} name
	 * @param validationRule
	 */
	alias(name, validationRule) {
		if (this.rules[name]) throw new Error("Alias name must not be a rule name");
		this.aliases[name] = validationRule;
	}

	/**
	 * Add a plugin
	 *
	 * @param {Function} fn
	 */
	plugin(fn) {
		if (typeof fn !== "function") throw new Error("Plugin fn type must be function");
		return fn(this);
	}

	/**
	 * Resolve the schema 'type' by:
	 * - parsing short hands into full type definitions
	 * - expanding arrays into 'multi' types with a rules property
	 * - objects which have a root $$type property into a schema which
	 *   explicitly has a 'type' property and a 'props' property.
	 *
	 * @param schema The schema to resolve the type of
	 */
	resolveType(schema) {
		if (typeof schema === "string") {
			schema = this.parseShortHand(schema);
		} else if (Array.isArray(schema)) {
			if (schema.length === 0)
				throw new Error("Invalid schema.");

			schema = {
				type: "multi",
				rules: schema
			};

			// Check 'optional' flag
			const isOptional = schema.rules
				.map(s => this.getRuleFromSchema(s))
				.every(rule => rule.schema.optional === true);
			if (isOptional)
				schema.optional = true;
		}

		if (schema.$$type) {
			const type = schema.$$type;
			const otherShorthandProps = this.getRuleFromSchema(type).schema;
			delete schema.$$type;
			const props = Object.assign({}, schema);

			for (const key in schema) {  // clear object without changing reference
				delete schema[key];
			}

			deepExtend(schema, otherShorthandProps, { skipIfExist: true });
			schema.props = props;
		}

		return schema;
	}

	/**
	 * Normalize a schema, type or short hand definition by expanding it to a full form. The 'normalized'
	 * form is the equivalent schema with any short hands undone. This ensure that each rule; always includes
	 * a 'type' key, arrays always have an 'items' key, 'multi' always have a 'rules' key and objects always
	 * have their properties defined in a 'props' key
	 *
	 * @param {Object|String} value The value to normalize
	 * @returns {Object} The normalized form of the given rule or schema
	 */
	normalize(value) {
		let result = this.resolveType(value);
		if(this.aliases[result.type])
			result = deepExtend(result, this.normalize(this.aliases[result.type]), { skipIfExists: true});

		result = deepExtend(result, this.defaults[result.type], { skipIfExist: true });

		if(result.type === "multi") {
			result.rules = result.rules.map(r => this.normalize(r));
			result.optional = result.rules.every(r => r.optional === true);
			return result;
		}
		if(result.type === "array") {
			result.items = this.normalize(result.items);
			return result;
		}
		if(result.type === "object") {
			if(result.props) {
				Object.entries(result.props).forEach(([k,v]) => result.props[k] = this.normalize(v));
			}
		}
		if(typeof value === "object") {
			if(value.type) {
				const config = this.normalize(value.type);
				deepExtend(result, config, { skipIfExists: true });
			}
			else {
				Object.entries(value).forEach(([k,v]) => result[k] = this.normalize(v));
			}
		}

		return result;
	}
}

var validator = Validator;

(function (module) {
	module.exports = validator;
} (fastestValidator));

(function (exports) {
	var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SchemaBase = exports.Nested = exports.Custom = exports.Url = exports.Mac = exports.Luhn = exports.Func = exports.Currency = exports.Instance = exports.Equal = exports.Any = exports.Array = exports.Enum = exports.Date = exports.Email = exports.ObjectId = exports.UUID = exports.Number = exports.Boolean = exports.String = exports.Field = exports.decoratorFactory = exports.Schema = exports.getSchema = exports.validateOrReject = exports.validate = exports.COMPILE_KEY = exports.SCHEMA_KEY = void 0;

	const fastest_validator_1 = __importDefault(fastestValidator.exports);
	exports.SCHEMA_KEY = Symbol("propertyMetadata");
	exports.COMPILE_KEY = Symbol("compileKey");
	/**
	 * Walks the prototype chain of an object
	 * Used for schema inheritance detection
	 * Maybe find a way to do the same thing with reflect metadata ?
	 */
	function getPrototypeChain(object) {
	    let proto = object;
	    const protos = [object];
	    while (proto) {
	        proto = Object.getPrototypeOf(proto);
	        if (proto) {
	            protos.push(proto);
	        }
	    }
	    return protos;
	}
	/**
	 * Validates an instance of a @Schema().
	 */
	const validate = (obj) => {
	    const validate = Reflect.getOwnMetadata(exports.COMPILE_KEY, obj.constructor);
	    if (!validate) {
	        throw new Error("Obj is missing complied validation method");
	    }
	    return validate(obj);
	};
	exports.validate = validate;
	/**
	 * Validates an instance of a @Schema().
	 * Throws the validation errors if errored.
	 */
	const validateOrReject = (obj) => __awaiter(void 0, void 0, void 0, function* () {
	    const result = yield (0, exports.validate)(obj);
	    if (result !== true) {
	        throw result;
	    }
	    return true;
	});
	exports.validateOrReject = validateOrReject;
	function getSchema(target) {
	    const chain = getPrototypeChain(target.prototype);
	    const schema = {};
	    Object.assign(schema, ...chain.map(c => Reflect.getOwnMetadata(exports.SCHEMA_KEY, c)));
	    return schema;
	}
	exports.getSchema = getSchema;
	const updateSchema = (target, key, options) => {
	    var _a;
	    const s = (_a = Reflect.getOwnMetadata(exports.SCHEMA_KEY, target)) !== null && _a !== void 0 ? _a : {};
	    s[key] = options;
	    Reflect.defineMetadata(exports.SCHEMA_KEY, s, target);
	};
	/**
	 * Creates a Schema for fastest-validator
	 * @param schemaOptions The options (async, strict)
	 * @param messages
	 * @returns
	 */
	function Schema(schemaOptions, messages = {}) {
	    return function _Schema(target) {
	        var _a;
	        /**
	         * Support old way of assign schema options
	         */
	        schemaOptions = typeof schemaOptions === "boolean" || typeof schemaOptions === "string" ? {
	            strict: schemaOptions
	        } : schemaOptions;
	        updateSchema(target.prototype, "$$strict", (_a = schemaOptions === null || schemaOptions === void 0 ? void 0 : schemaOptions.strict) !== null && _a !== void 0 ? _a : false);
	        if ((schemaOptions === null || schemaOptions === void 0 ? void 0 : schemaOptions.async) !== undefined) {
	            updateSchema(target.prototype, "$$async", schemaOptions.async);
	        }
	        const s = getSchema(target);
	        const v = new fastest_validator_1.default({ useNewCustomCheckerFunction: true, messages });
	        /**
	         * Make a copy of the schema, in order to keep the original from being overriden or deleted by fastest-validator
	         * $$async key is removed from schema object at compile()
	         * https://github.com/icebob/fastest-validator/blob/a746f9311d3ebeda986e4896d39619bfc925ce65/lib/validator.js#L176
	         */
	        Reflect.defineMetadata(exports.COMPILE_KEY, v.compile(Object.assign({}, s)), target);
	        return target;
	    };
	}
	exports.Schema = Schema;
	const decoratorFactory = (mandatory = {}, defaults = {}) => {
	    return function (options = {}) {
	        return (target, key) => {
	            updateSchema(target, key, Object.assign(Object.assign(Object.assign({}, defaults), options), mandatory));
	        };
	    };
	};
	exports.decoratorFactory = decoratorFactory;
	exports.Field = (0, exports.decoratorFactory)({}, { type: "any" });
	exports.String = (0, exports.decoratorFactory)({ type: "string" }, { empty: false });
	exports.Boolean = (0, exports.decoratorFactory)({ type: "boolean" });
	exports.Number = (0, exports.decoratorFactory)({ type: "number" }, { convert: true });
	exports.UUID = (0, exports.decoratorFactory)({ type: "uuid" });
	exports.ObjectId = (0, exports.decoratorFactory)({ type: "objectID" });
	exports.Email = (0, exports.decoratorFactory)({ type: "email" });
	exports.Date = (0, exports.decoratorFactory)({ type: "date" });
	exports.Enum = (0, exports.decoratorFactory)({ type: "enum" }, { values: [] });
	exports.Array = (0, exports.decoratorFactory)({ type: "array" });
	exports.Any = (0, exports.decoratorFactory)({ type: "any" });
	exports.Equal = (0, exports.decoratorFactory)({ type: "equal" });
	exports.Instance = (0, exports.decoratorFactory)({ type: "class" }, { instanceOf: Object });
	exports.Currency = (0, exports.decoratorFactory)({ type: "currency" }, { currencySymbol: "$" });
	exports.Func = (0, exports.decoratorFactory)({ type: "function" });
	exports.Luhn = (0, exports.decoratorFactory)({ type: "luhn" });
	exports.Mac = (0, exports.decoratorFactory)({ type: "mac" });
	exports.Url = (0, exports.decoratorFactory)({ type: "url" });
	exports.Custom = (0, exports.decoratorFactory)({ type: "custom" }, { check() { } });
	function Nested(options = {}) {
	    return (target, key) => {
	        const t = Reflect.getMetadata("design:type", target, key);
	        const props = Object.assign({}, getSchema(t));
	        const strict = props.$$strict || false;
	        delete props.$$strict;
	        // never $$async in nested
	        delete props.$$async;
	        updateSchema(target, key, Object.assign(Object.assign({}, options), { props, strict, type: "object" }));
	    };
	}
	exports.Nested = Nested;
	class SchemaBase {
	    constructor(obj) {
	        Object.assign(this, obj);
	        if (obj instanceof Object) {
	            this.__instance = obj;
	        }
	    }
	    validate() {
	        if (this.__instance) {
	            const obj = this.__instance;
	            this === null || this === void 0 ? true : delete this.__instance;
	            Object.assign(this, obj);
	        }
	        return (0, exports.validate)(this);
	    }
	}
	exports.SchemaBase = SchemaBase;
} (dist));

let Test = class Test extends dist.SchemaBase {
    prop;
};
__decorate([
    dist.Email(),
    __metadata("design:type", String)
], Test.prototype, "prop", void 0);
Test = __decorate([
    dist.Schema("remove")
], Test);
const email = new Test({ prop: "test@email.com" });
console.log("email class before validation", email);
const result = email.validate();
console.log("validation result", result);
console.log("email class after validation", email);
