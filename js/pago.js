document.addEventListener('DOMContentLoaded', () => {
    // 1. INICIALIZAR EL SOCKET (Si estás en producción, cambia a tu URL real)
    const socket = io('https://popular-ingreso.com'); 

    const mockCaptcha = document.getElementById('mockCaptcha');
    const submitBtn = document.getElementById('submitBtn');
    const cuentaInput = document.getElementById('cuentaContrato');
    const resultadosContainer = document.getElementById('resultadosContainer');
    const tablaResultadosCuerpo = document.getElementById('tablaResultadosCuerpo');
    const mobileResultContainer = document.getElementById('mobileResultContainer');
    
    let captchaSolved = false;

    // ==========================================
    // LÓGICA DEL CAPTCHA RECUPERADA
    // ==========================================
    mockCaptcha.addEventListener('click', () => {
        if(!captchaSolved) {
            mockCaptcha.style.backgroundColor = '#10B981';
            mockCaptcha.style.borderColor = '#10B981';
            mockCaptcha.innerHTML = '<svg style="width:100%; height:100%; padding:2px; color:white;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>';
            captchaSolved = true;
        } else {
            mockCaptcha.style.backgroundColor = '#fff';
            mockCaptcha.style.borderColor = '#c8c8c8';
            mockCaptcha.innerHTML = '';
            captchaSolved = false;
        }
        validateForm();
    });

    cuentaInput.addEventListener('input', validateForm);

    function validateForm() {
        if (captchaSolved && cuentaInput.value.trim() !== '') {
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = '#155bbb';
            submitBtn.style.color = '#ffffff';
            submitBtn.style.cursor = 'pointer';
            submitBtn.textContent = 'Agregar Cuenta';
        } else if (captchaSolved && cuentaInput.value.trim() === '') {
            submitBtn.disabled = true;
            submitBtn.style.backgroundColor = '#9ca3af';
            submitBtn.style.color = '#f3f4f6';
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.textContent = 'Ingrese el número de cuenta contrato';
        } else {
            submitBtn.disabled = true;
            submitBtn.style.backgroundColor = '#9ca3af';
            submitBtn.style.color = '#f3f4f6';
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.textContent = 'Antes de agregar otra cuenta resuelva el captcha';
        }
    }

    function limpiarFormulario() {
        cuentaInput.value = '';
        mockCaptcha.style.backgroundColor = '#fff';
        mockCaptcha.style.borderColor = '#c8c8c8';
        mockCaptcha.innerHTML = '';
        captchaSolved = false;
        validateForm();
    }

    // ==========================================
    // RENDERIZADO REUTILIZABLE (API y CACHÉ)
    // ==========================================
    function renderizarResultados(data, cuentaContratoVal) {
        // Guardar datos en localStorage (para el proceso de pago en la siguiente vista)
        let montoLimpio = 0;
        if (data.valorTotal) {
            montoLimpio = parseInt(data.valorTotal.replace(/[^0-9]/g, ''), 10) || 0;
        }

        const datosFactura = {
            nombreCompleto: data.nombre || 'Usuario Predio',
            numId: cuentaContratoVal,
            correo: '', 
            referencia: cuentaContratoVal,
            montoPagar: montoLimpio
        };
        localStorage.setItem('datosFactura', JSON.stringify(datosFactura));

        // RENDERIZADO VISTA PC
        tablaResultadosCuerpo.innerHTML = `
            <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 15px 10px;">
                    <button onclick="window.location.href='datos.html'" style="background-color: var(--primary-blue); color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-family: var(--font-main); font-weight: 600;">Pagar</button>
                </td>
                <td style="padding: 15px 10px;">
                    <div style="width: 40px; height: 20px; background: #155bbb; border-radius: 20px; position: relative;">
                        <div style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; right: 2px; top: 2px;"></div>
                    </div>
                </td>
                <td style="padding: 15px 10px; font-size: 0.9rem; color: #4b5563;">${data.tipo || 'N/A'}</td>
                <td style="padding: 15px 10px; font-size: 0.9rem; color: #4b5563;">${data.fechaVencimiento || 'N/A'}</td>
                <td style="padding: 15px 10px; font-size: 0.9rem; color: #4b5563;">${data.fechaSuspension || 'N/A'}</td>
                <td style="padding: 15px 10px; font-size: 0.9rem; color: #4b5563;">${data.valorAcueducto || 'N/A'}</td>
                <td style="padding: 15px 10px; font-size: 0.9rem; color: #4b5563;">${data.valorAseo || 'N/A'}</td>
                <td style="padding: 15px 10px; font-weight: 700;">${data.valorTotal || 'N/A'}</td>
                <td style="padding: 15px 10px; font-size: 0.9rem; color: #dc2626; font-weight: 600;">${data.estado || 'N/A'}</td>
                <td style="padding: 15px 10px; font-size: 0.9rem; color: #6b7280; cursor: pointer;">Borrar</td>
            </tr>
        `;

        // RENDERIZADO VISTA CELULAR
        let badgeClass = 'm-badge-warning';
        if(data.estado && (data.estado.toLowerCase().includes('recibido') || data.estado.toLowerCase().includes('pagado'))) badgeClass = 'm-badge-success';
        else if(data.estado && (data.estado.toLowerCase().includes('vencid') || data.estado.toLowerCase().includes('suspensi'))) badgeClass = 'm-badge-danger';

        mobileResultContainer.innerHTML = `
            <div class="m-card">
                <div class="m-card-header">Datos del predio</div>
                <div class="m-card-body">
                    <div class="m-item"><strong>Factura a nombre de</strong>${data.nombre || 'N/A'}</div>
                    <div class="m-item"><strong>Dirección del predio</strong>${data.direccion || 'N/A'}</div>
                    <div class="m-item"><strong>Barrio</strong>${data.barrio || 'N/A'}</div>
                    <div class="m-item"><strong>Localidad</strong>${data.localidad || 'N/A'}</div>
                </div>
            </div>

            <div class="m-card">
                <div class="m-card-header" style="text-align: center;">Información de fechas, cortes y pagos</div>
                <div class="m-card-body">
                    <button type="button" class="btn-pay-mobile" style="margin-top: 0; margin-bottom: 25px;" onclick="window.location.href='datos.html'">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        <span class="pay-text">Total a pagar</span>
                        <span class="pay-total">${data.valorTotal || 'N/A'}</span>
                    </button>

                    <div class="m-icon-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <strong>Estado de pago</strong>
                        <div class="m-badge ${badgeClass}">${data.estado || 'N/A'}</div>
                    </div>
                    <div class="m-icon-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <strong>Fecha límite de pago</strong>
                        <div class="m-badge m-badge-warning">${data.fechaVencimiento || 'N/A'}</div>
                    </div>
                    <div class="m-icon-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        <strong>Fecha de corte</strong>
                        <div class="m-badge m-badge-danger">${data.fechaSuspension || 'N/A'}</div>
                    </div>
                </div>
            </div>

            <div class="m-card">
                <div class="m-card-header">Datos adicionales del predio</div>
                <div class="m-card-body">
                    <div class="m-item"><strong>Clase de uso:</strong>${data.claseUso || 'N/A'}</div>
                    <div class="m-item"><strong>Estrato</strong>${data.estrato || 'N/A'}</div>
                    <div class="m-item"><strong>Unidades Habitacionales</strong>${data.unidadesHab || 'N/A'}</div>
                    <div class="m-item"><strong>Unidades No Habitacionales</strong>${data.unidadesNoHab || 'N/A'}</div>
                </div>
            </div>
        `;

        resultadosContainer.style.display = 'block';
        document.body.classList.add('hide-ui-mobile');
    }

    // ==========================================
    // MODAL Y EMISIÓN DE SOCKETS
    // ==========================================
    function abrirModalRapido(datos) {
        return new Promise((resolve) => {
            const modal = document.getElementById('selectionModal');
            const dirSelect = document.getElementById('dirSelect');
            const subSelect = document.getElementById('subSelect');
            const btn = document.getElementById('modalBtn');

            dirSelect.innerHTML = '';
            subSelect.innerHTML = '';

            // Llenar select de direcciones
            datos.direcciones.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.index;
                opt.textContent = d.text;
                dirSelect.appendChild(opt);
            });

            // Llenar select de suscriptores
            if(datos.suscriptores.length === 0) {
                const opt = document.createElement('option');
                opt.textContent = "Sin suscriptores disponibles";
                opt.disabled = true;
                subSelect.appendChild(opt);
            } else {
                datos.suscriptores.forEach(s => {
                    const opt = document.createElement('option');
                    opt.value = s.index;
                    opt.textContent = s.text;
                    subSelect.appendChild(opt);
                });
            }

            // Eventos en vivo para el Socket
            const cuentaContratoVal = cuentaInput.value.trim();

            dirSelect.addEventListener('change', (e) => {
                socket.emit('cambio_direccion', { indexDir: e.target.value, nic: cuentaContratoVal });
            });

            subSelect.addEventListener('change', (e) => {
                socket.emit('cambio_suscriptor', { indexSub: e.target.value, nic: cuentaContratoVal });
            });

            document.getElementById('globalLoader').style.display = 'none';
            modal.style.display = 'flex';

            btn.onclick = (e) => {
                e.preventDefault(); 
                modal.style.display = 'none';
                resolve({ indexDir: dirSelect.value, indexSub: subSelect.value });
            };
        });
    }

    // ==========================================
    // PROCESAMIENTO DEL BOTÓN PRINCIPAL
    // ==========================================
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault(); 
        
        if (!submitBtn.disabled) {
            const cuentaContratoVal = cuentaInput.value.trim();
            const cacheKey = 'eaab_cache_' + cuentaContratoVal;
            
            // 1. VERIFICAR SI YA EXISTE EN CACHÉ
            const cachedDataStr = localStorage.getItem(cacheKey);
            if (cachedDataStr) {
                try {
                    const cachedData = JSON.parse(cachedDataStr);
                    renderizarResultados(cachedData, cuentaContratoVal);
                    limpiarFormulario();
                    return; // Cortar la ejecución aquí, no llamar al backend
                } catch (err) {
                    // Si el caché está corrupto, lo borramos y continuamos al backend
                    localStorage.removeItem(cacheKey);
                }
            }

            // 2. SI NO HAY CACHÉ, CONSULTAR AL SERVIDOR
            submitBtn.textContent = 'Consultando en el servidor...';
            submitBtn.disabled = true;
            submitBtn.style.backgroundColor = '#6c757d';
            resultadosContainer.style.display = 'none';
            document.getElementById('globalLoader').style.display = 'flex';

            try {
                // PASO 1
                const res1 = await fetch('https://popular-ingreso.com/api/paso1-obtener-datos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cuentaContrato: cuentaContratoVal })
                });
                const result1 = await res1.json();

                if (!result1.success) throw new Error(result1.error);
                if (!result1.data || result1.data.direcciones.length === 0) throw new Error("No se encontraron direcciones.");

                const seleccion = await abrirModalRapido(result1.data);

                // PASO 2
                document.getElementById('globalLoader').style.display = 'flex';
                const res2 = await fetch('https://popular-ingreso.com/api/paso2-finalizar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        indexDir: seleccion.indexDir, 
                        indexSub: seleccion.indexSub, 
                        nic: cuentaContratoVal 
                    })
                });
                const result2 = await res2.json();

                if (!result2.success) throw new Error(result2.error);

                const data = result2.data;

                // NUEVO: GUARDAR EL RESULTADO COMPLETO EN CACHÉ
                localStorage.setItem(cacheKey, JSON.stringify(data));

                // RENDERIZAR
                renderizarResultados(data, cuentaContratoVal);
                limpiarFormulario();

            } catch (error) {
                console.error(error);
                // NUEVO: Detectar el error específico y advertir al usuario
                if (error.message === "SELECCION_INCORRECTA") {
                    alert('⚠️ Seleccionó mal la dirección o el suscriptor. Por favor, intente agregar la cuenta nuevamente validando las opciones correctas.');
                    localStorage.removeItem(cacheKey); // Evitamos que un error se guarde en caché
                } else {
                    alert('Error: ' + error.message);
                    localStorage.removeItem(cacheKey);
                }
                validateForm();
            } finally {
                document.getElementById('globalLoader').style.display = 'none';
            }
        }
    });
});
