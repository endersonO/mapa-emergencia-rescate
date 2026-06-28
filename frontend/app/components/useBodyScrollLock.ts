"use client";

import { useEffect } from "react";

/**
 * Bloqueo de scroll del body compartido por todos los modales/overlays.
 *
 * Por qué un solo hook (y no `overflow:hidden` suelto en cada modal):
 *  - En iOS Safari `overflow:hidden` NO frena el scroll de la página; hay que
 *    fijar el body (`position:fixed`) y restaurar la posición al cerrar. Así el
 *    fondo (y el mapa) no se mueven detrás del modal.
 *  - Con varios modales apilados (p. ej. detalle de persona → lightbox) un
 *    lock/unlock por modal se pisa entre sí. Llevamos un contador a nivel de
 *    módulo: el primero fija y guarda el scroll; el último restaura.
 *
 * Uso: `useBodyScrollLock(open)` — pasa el estado abierto/cerrado del modal, o
 * `true` si el componente solo se monta cuando está abierto.
 */
let lockCount = 0;
let savedScrollY = 0;

function applyLock() {
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    const { style } = document.body;
    style.position = "fixed";
    style.top = `-${savedScrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflow = "hidden";
  }
  lockCount += 1;
}

function releaseLock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    const { style } = document.body;
    style.position = "";
    style.top = "";
    style.left = "";
    style.right = "";
    style.width = "";
    style.overflow = "";
    window.scrollTo(0, savedScrollY);
  }
}

export function useBodyScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return;
    applyLock();
    return releaseLock;
  }, [open]);
}
