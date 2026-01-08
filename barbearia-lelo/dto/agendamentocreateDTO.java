// dto/AgendamentoCreateDTO.java
package com.exemplo.barbearia.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Future;
import java.time.LocalDateTime;

public record AgendamentoCreateDTO(
        @NotNull Long clienteId,
        @NotNull Long barbeiroId,
        @NotNull @Future LocalDateTime inicio,
        @NotNull LocalDateTime fim
) {}

// dto/AgendamentoDTO.java
package com.exemplo.barbearia.dto;

import java.time.LocalDateTime;

public record AgendamentoDTO(
        Long id, Long clienteId, Long barbeiroId,
        LocalDateTime inicio, LocalDateTime fim,
        String status
) {}

// dto/DisponibilidadeQueryDTO.java
package com.exemplo.barbearia.dto;

import java.time.LocalDateTime;

public record DisponibilidadeQueryDTO(
        Long barbeiroId,
        LocalDateTime inicio,
        LocalDateTime fim,
        int duracaoMinutos
) {}
