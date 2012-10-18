/**
 * @package datastructures.LinkedList;
 *
 * Linked list implementation tuned for v8. Courtesy @isaacs.
 * https://github.com/isaacs/fast-list
 *
 * Copyright (c) Isaac Z. Schlueter
 * All rights reserved.
 * 
 * The BSD License
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE NETBSD FOUNDATION, INC. AND CONTRIBUTORS
 * ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE FOUNDATION OR CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

var Item = Class(function (supr) {
	this.init = function (data, prev, next) {
		this.next = next
		if (next) next.prev = this
		this.prev = prev
		if (prev) prev.next = this
		this.data = data
	};
});

var LinkedList = exports = Class(function (supr) {
	this.init = function () {
		this._head = null
		this._tail = null
		this.length = 0
	}

	this.push = function (data) {
		this._tail = new Item(data, this._tail, null)
		if (!this._head) this._head = this._tail
		this.length ++
	};

	this.pop = function () {
		if (this.length === 0) return undefined
		var t = this._tail
		this._tail = t.prev
		if (t.prev) {
			t.prev = this._tail.next = null
		}
		this.length --
		if (this.length === 1) this._head = this._tail
		else if (this.length === 0) this._head = this._tail = null
		return t.data
	};

	this.unshift = function (data) {
		this._head = new Item(data, null, this._head)
		if (!this._tail) this._tail = this._head
		this.length ++
	};

	this.shift = function () {
		if (this.length === 0) return undefined
		var h = this._head
		this._head = h.next
		if (h.next) {
			h.next = this._head.prev = null
		}
		this.length --
		if (this.length === 1) this._tail = this._head
		else if (this.length === 0) this._head = this._tail = null
		return h.data
	};

	this.item = function (n) {
		if (n < 0) n = this.length + n
		var h = this._head
		while (n-- > 0 && h) h = h.next
		return h ? h.data : undefined
	};

	this.slice = function (n, m) {
		if (!n) n = 0
		if (!m) m = this.length
		if (m < 0) m = this.length + m
		if (n < 0) n = this.length + n

		if (m === n) {
			return []
		}

		if (m < n) {
			throw new Error("invalid offset: "+n+","+m+" (length="+this.length+")")
		}

		var len = m - n
			, ret = new Array(len)
			, i = 0
			, h = this._head
		while (n-- > 0 && h) h = h.next
		while (i < len && h) {
			ret[i++] = h.data
			h = h.next
		}
		return ret
	};

	this.drop = function () {
		LinkedList.call(this)
	};

	this.forEach = function (fn, thisp) {
		var p = this._head
			, i = 0
			, len = this.length
		while (i < len && p) {
			fn.call(thisp || this, p.data, i, this)
			p = p.next
			i ++
		}
	};

	this.map = function (fn, thisp) {
		var n = new LinkedList()
		this.forEach(function (v, i, me) {
			n.push(fn.call(thisp || me, v, i, me))
		})
		return n
	};

	this.filter = function (fn, thisp) {
		var n = new LinkedList()
		this.forEach(function (v, i, me) {
			if (fn.call(thisp || me, v, i, me)) n.push(v)
		})
		return n
	};

	this.reduce = function (fn, val, thisp) {
		var i = 0
			, p = this._head
			, len = this.length
		if (!val) {
			i = 1
			val = p && p.data
			p = p && p.next
		}
		while (i < len && p) {
			val = fn.call(thisp || this, val, p.data, this)
			i ++
			p = p.next
		}
		return val
	};
});